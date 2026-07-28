# SmartBot - Modern AI Chatbot

A fast, responsive, and feature-rich AI Chatbot built with React, TypeScript, Tailwind CSS, and Vercel Serverless Functions. Powered by the Llama-3.3-70b-versatile model via the Groq API, it features real-time text streaming, Markdown rendering, and chat history persistence.

## Features

* **Secure API Handling:** API requests are routed through a Vercel serverless backend to keep your API keys completely hidden from the client.
* **Real-Time Streaming:** Watch the AI's response type out in real-time, providing a seamless experience.
* **Local Storage Persistence:** Your chat history is automatically saved to your browser and reloads when you return.
* **Markdown Support:** Code blocks, bold text, and lists are beautifully rendered using react-markdown.
* **Copy to Clipboard:** Easily copy bot responses with a single click.
* **Smart Suggestions:** Interactive prompt suggestions to help start conversations.
* **Modern UI/UX:** Glassmorphism design, smooth scrolling, and dynamic typing indicators built with Tailwind CSS.

## Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Backend:** Vercel Serverless Functions (Node.js)
* **Styling:** Tailwind CSS (v4)
* **Icons:** react-icons (Lucide icons)
* **Markdown:** react-markdown
* **API / LLM:** Groq API (using llama-3.3-70b-versatile)

## Project Structure

```text
.
├── api/
│   └── chat.ts              # Serverless backend function (secures API key & handles streaming)
├── src/
│   ├── components/
│   │   └── ChatComponent.tsx    # Main UI layout, chat interface, and input handling
│   ├── hooks/
│   │   ├── useChatbot.ts        # Handles fetching to /api/chat, state, and LocalStorage
│   │   └── useChatScroll.ts     # Auto-scrolls to the newest message automatically
│   ├── App.tsx                  # Root component layout
│   ├── App.css                  # Global styles
│   ├── main.tsx                 # React DOM rendering
│   └── index.css                # Tailwind CSS imports
├── .env                     # Environment variables (Backend Secrets)
└── package.json             # Project dependencies
