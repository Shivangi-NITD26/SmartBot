import { useState, useEffect } from "react";

export interface Message {
  text: string;
  sender: "user" | "bot";
}

const DEFAULT_GREETING = "Hello! I am SmartBot. How can I help you today?";

const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedChat = localStorage.getItem("my_ai_chat_history");
    if (savedChat) {
      try {
        return JSON.parse(savedChat);
      } catch (e) {
        return [{ text: DEFAULT_GREETING, sender: "bot" }];
      }
    }
    return [{ text: DEFAULT_GREETING, sender: "bot" }];
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("my_ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    setMessages([{ text: DEFAULT_GREETING, sender: "bot" }]);
    localStorage.removeItem("my_ai_chat_history");
  };

  const sendMessage = async (message: string) => {
    const newMessages: Message[] = [
      ...messages,
      { text: message, sender: "user" },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: "system", content: "You are a highly intelligent and helpful AI assistant. Answer formatting in Markdown." },
        ...newMessages
          .filter(msg => msg.text !== DEFAULT_GREETING) 
          .map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          }))
      ];

      // SECURE CHANGE: Call our own backend instead of Groq directly
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
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
      }
    } catch (error: any) {
      console.error("Error fetching AI response:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { text: `🛑 **ERROR:** ${error.message}`, sender: "bot" },
      ]);
    }
  };

  return { messages, sendMessage, isLoading, clearChat };
};

export default useChatbot;