import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  X,
  Bot,
  Sparkles,
  Loader2,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import SuggestedPrompts from "./SuggestedPrompts";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/toastContext";
import { aiAPI } from "../../services/api";

const ChatWindow = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Load conversation from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("valentique-chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.messages || []);
        setConversationId(parsed.conversationId || null);
      } catch {
        // Ignore corrupted data
      }
    }
  }, []);

  // Save conversation to sessionStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(
        "valentique-chat",
        JSON.stringify({ messages, conversationId })
      );
    }
  }, [messages, conversationId]);

  const handleSend = useCallback(
    async (text) => {
      const messageText = (text || input).trim();
      if (!messageText || isLoading) return;

      setInput("");

      // Add user message
      const userMessage = {
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await aiAPI.chat({
          message: messageText,
          conversationId,
        });

        const data = response.data;

        // Save conversationId for follow-ups
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        // Add assistant message
        const assistantMessage = {
          role: "assistant",
          content: data.message,
          products: data.products || [],
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          "Something went wrong. Please try again.";

        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            content: errorMsg,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationId]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    sessionStorage.removeItem("valentique-chat");

    if (conversationId) {
      aiAPI.clearHistory(conversationId).catch(() => {});
    }
  }, [conversationId]);

  const handleAddToCart = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        showToast("Please login to add items to cart", "error");
        return;
      }

      const result = await addToCart(productId, 1);
      if (result.success) {
        showToast("Added to cart successfully", "success");
      } else {
        showToast(result.message, "error");
      }
    },
    [isAuthenticated, addToCart, showToast]
  );

  const showSuggestions = messages.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          className="
            fixed bottom-24 right-4 sm:right-6
            w-[calc(100vw-2rem)] sm:w-[400px]
            h-[min(600px,calc(100vh-8rem))]
            z-[60]
            flex flex-col
            rounded-2xl
            bg-zinc-950/95
            backdrop-blur-2xl
            border border-white/10
            shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(245,158,11,0.05)]
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-600/20 flex items-center justify-center border border-purple-500/20">
                  <Bot className="h-4.5 w-4.5 text-purple-400" />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-wide flex items-center gap-1.5">
                  Style Concierge
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </h3>
                <p className="text-[10px] text-zinc-500 tracking-wider uppercase">
                  AI Shopping Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            {/* Welcome message when empty */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center border border-white/5">
                  <Sparkles className="h-7 w-7 text-amber-500" />
                </div>
                <h4 className="text-base font-medium text-white mb-1.5">
                  Welcome to Valentique
                </h4>
                <p className="text-xs text-zinc-500 max-w-70 mx-auto leading-relaxed">
                  I'm your personal shopping assistant. Tell me what you're
                  looking for and I'll find the perfect luxury bag for you.
                </p>
              </motion.div>
            )}

            {showSuggestions && (
              <SuggestedPrompts onSelect={(text) => handleSend(text)} />
            )}

            {/* Chat Messages */}
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                onAddToCart={handleAddToCart}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-white/5 bg-zinc-900/30">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about bags, styles, materials..."
                  rows={1}
                  className="
                    w-full px-4 py-3 pr-4
                    bg-zinc-800/50 border border-white/5
                    rounded-xl
                    text-sm text-white
                    placeholder:text-zinc-600
                    focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/10
                    resize-none
                    transition-all duration-200
                    max-h-24
                    [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                  "
                  style={{
                    height: "auto",
                    minHeight: "44px",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 96) + "px";
                  }}
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="
                  h-11 w-11 flex items-center justify-center
                  rounded-xl mb-1.5
                  bg-amber-500 text-black
                  hover:bg-amber-400
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-200
                  cursor-pointer
                  active:scale-95
                  shrink-0
                "
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Animated typing indicator dots
 */
const TypingIndicator = () => (
  <div className="flex gap-2.5">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-600/20 flex items-center justify-center border border-purple-500/20 shrink-0 mt-0.5">
      <Bot className="h-3.5 w-3.5 text-purple-400" />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-zinc-800/70 border border-white/5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default ChatWindow;
