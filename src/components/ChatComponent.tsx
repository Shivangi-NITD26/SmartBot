import * as React from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { 
  LuBot, 
  LuSendHorizontal, 
  LuTrash2, 
  LuUser, 
  LuCopy, 
  LuCheck, 
  LuSparkles,
  LuSquare,
  LuMic
} from "react-icons/lu";
import useChatbot from "../hooks/useChatbot";
import Markdown from "react-markdown";
import useChatScroll from "../hooks/useChatScroll";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SUGGESTIONS = [
  "Can you help me write a professional email?",
  "What is an easy recipe for a quick dinner?",
  "Draft a polite text message to cancel plans.",
  "Give me 5 fun facts to learn something new."
];

const ChatComponent: React.FunctionComponent = () => {
  const [input, setInput] = React.useState("");
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  const { messages, sendMessage, isLoading, clearChat, stopGenerating } = useChatbot();
  const ref = useChatScroll(messages);

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex justify-center items-center p-4 font-sans">
      
      <div className="flex flex-col h-[90vh] w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden">
        
        <div className="p-5 bg-white/50 backdrop-blur-md border-b border-gray-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
              <LuBot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-800">SmartBot</h2>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online & Ready
              </p>
            </div>
          </div>
          <button 
            onClick={clearChat} 
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200" 
            title="Clear Chat"
          >
            <LuTrash2 size={22} />
          </button>
        </div>

        <div 
          ref={ref} 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
          {messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              <div className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                  {msg.sender === "user" ? <LuUser size={16} className="text-white"/> : <LuBot size={18} className="text-white"/>}
                </div>

                <div className="group relative max-w-[85%] md:max-w-[75%]">
                  <div className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                  <Markdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    className={`prose prose-sm md:prose-base max-w-none break-words ${msg.sender === 'user' ? 'text-white prose-p:text-white prose-strong:text-white prose-a:text-white' : 'text-gray-800'}`}
                    components={{
                      code({ node, className, children, ...rest }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <div className="relative mt-4 mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-700/50">
                            <SyntaxHighlighter
                              PreTag="div"
                              children={String(children).replace(/\n$/, '')}
                              language={match[1]}
                              style={vscDarkPlus as any}
                              customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '0.875rem' }}
                            />
                          </div>
                        ) : (
                          <code {...rest} className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded-md text-sm font-mono font-semibold">
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {msg.text}
                  </Markdown>
                  </div>

                  {msg.sender === "bot" && index !== 0 && (
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="absolute -right-12 top-2 p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy message"
                    >
                      {copiedIndex === index ? <LuCheck size={16} className="text-green-500" /> : <LuCopy size={16} />}
                    </button>
                  )}
                </div>
              </div>

              {index === 0 && messages.length === 1 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto ml-12">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-3 border border-gray-200 rounded-xl bg-white hover:border-blue-400 hover:shadow-md transition-all text-sm text-gray-600 flex items-center gap-2 group"
                    >
                      <LuSparkles className="text-yellow-400 group-hover:text-blue-500 transition-colors" size={16} />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm">
                <LuBot size={18} className="text-white"/>
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center h-[52px]">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <input
              type="text"
              className="flex-1 w-full p-4 pr-24 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 disabled:opacity-50"
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isListening
                    ? "bg-red-100 text-red-500 animate-pulse"
                    : "bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                }`}
                title={isListening ? "Stop listening" : "Start Voice Input"}
              >
                <LuMic size={20} />
              </button>

              <button
                onClick={isLoading ? stopGenerating : handleSend}
                disabled={!isLoading && !input.trim() && !isListening}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  !isLoading && !input.trim()
                    ? "bg-transparent text-gray-400 cursor-not-allowed"
                    : isLoading
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 animate-pulse"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                }`}
                title={isLoading ? "Stop generating" : "Send message"}
              >
                {isLoading ? <LuSquare size={20} className="fill-current" /> : <LuSendHorizontal size={20} />}
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3 font-medium">
            AI can make mistakes. Consider verifying important information.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ChatComponent;