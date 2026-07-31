"use client";

import { useState, useEffect, useRef } from "react";

type Conversation = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data.conversations || []);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    const res = await fetch("/api/conversations", { method: "POST" });
    const data = await res.json();
    await loadConversations();
    setActiveId(data.conversation.id);
    setMessages([]);
  };

  const handleSelectConversation = async (id: string) => {
    setActiveId(id);
    setError("");
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    setMessages(data.conversation?.messages || []);
  };

  const handleDeleteConversation = async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;

    const userMessage = input;
    setInput("");
    setError("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: userMessage, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi du message");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: `temp-r-${Date.now()}`, role: "assistant", content: data.reply, createdAt: new Date().toISOString() },
      ]);
      await loadConversations();
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6 h-[calc(100vh-100px)]">
      {/* Sidebar conversations */}
      <div className="w-64 flex flex-col gap-2 border-r border-gray-200 dark:border-gray-700 pr-4">
        <button
          onClick={handleNewConversation}
          className="bg-[#C9A227] text-[#3D0714] py-2 rounded-lg text-sm font-medium hover:bg-[#E4C578]"
        >
          + Nouvelle conversation
        </button>

        <div className="flex flex-col gap-1 overflow-y-auto mt-2">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm ${
                activeId === c.id
                  ? "bg-[#C9A227]/10 dark:bg-gray-700 text-[#5C0A1E] dark:text-[#E4C578]"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleSelectConversation(c.id)}
            >
              <span className="truncate">{c.title || "Nouvelle conversation"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(c.id);
                }}
                className="text-xs text-red-500 hover:underline ml-2 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Chat IA
        </h1>

        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Sélectionne une conversation ou crée-en une nouvelle.
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "self-end bg-[#5C0A1E] text-white"
                      : "self-start bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="self-start bg-gray-100 dark:bg-gray-700 text-gray-500 px-4 py-2 rounded-lg text-sm">
                  L'assistant réfléchit...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écris ton message..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#5C0A1E]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-[#C9A227] text-[#3D0714] px-4 py-2 rounded-lg hover:bg-[#E4C578] disabled:opacity-50 text-sm font-medium"
              >
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}