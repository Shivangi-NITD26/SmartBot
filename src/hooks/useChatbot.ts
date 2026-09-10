import { useState, useRef } from "react";

export interface Message {
  text: string;
  sender: "user" | "bot";
}

const DEFAULT_GREETING = "Hello! I am SmartBot. How can I help you today?";

const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: DEFAULT_GREETING, sender: "bot" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearChat = () => {
    setMessages([{ text: DEFAULT_GREETING, sender: "bot" }]);
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    const newMessages: Message[] = [
      ...messages,
      { text: message, sender: "user" },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const apiMessages = [
        { 
          role: "system", 
          content: "You are a highly intelligent and helpful AI assistant. You format your answers dynamically based on what makes the most sense for the user's prompt. Use rich, flowing paragraphs for stories, essays, and conversational replies. Use bullet points or numbered lists when providing lists, steps, interview questions, or recipes. Use markdown to make your text beautiful and easy to read." 
        },
        ...newMessages
          .filter(msg => msg.text !== DEFAULT_GREETING)
          .map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          }))
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
        signal: abortControllerRef.current.signal, 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown API Error");
      }

      setIsLoading(false); 
      setMessages((prev) => [...prev, { text: "", sender: "bot" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessageText = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.trim() === "data: [DONE]") return;

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              const delta = data.choices?.[0]?.delta?.content;
              
              if (delta) {
                botMessageText += delta; 
                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  updatedMessages[updatedMessages.length - 1].text = botMessageText;
                  return updatedMessages;
                });
              }
            } catch (err) {
              console.error("Error parsing stream chunk", err);
            }
          }
        } 
        
        await new Promise((resolve) => setTimeout(resolve, 30));
      } 
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Generation stopped by user");
      } else {
        console.error("Error fetching AI response:", error);
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { text: `🛑 **ERROR:** ${error.message}`, sender: "bot" },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return { messages, sendMessage, isLoading, clearChat, stopGenerating };
};

export default useChatbot;