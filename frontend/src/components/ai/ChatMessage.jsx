import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ProductRecommendationCard from "./ProductRecommendationCard";

const ChatMessage = ({ message, onAddToCart }) => {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`
          shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5
          ${isUser
            ? "bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/20"
            : isError
              ? "bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/20"
              : "bg-gradient-to-br from-purple-500/30 to-violet-600/20 border border-purple-500/20"
          }
        `}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <Bot
            className={`h-3.5 w-3.5 ${isError ? "text-red-400" : "text-purple-400"}`}
          />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`
          flex flex-col gap-2 max-w-[80%]
          ${isUser ? "items-end" : "items-start"}
        `}
      >
        {/* Text Bubble */}
        <div
          className={`
            px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
            ${isUser
              ? "bg-amber-500/15 border border-amber-500/20 text-zinc-200 rounded-br-md"
              : isError
                ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md"
                : "bg-zinc-800/70 border border-white/5 text-zinc-300 rounded-bl-md"
            }
          `}
        >
          {/* Render markdown-like formatting */}
          <MessageContent text={message.content} />
        </div>

        {/* Product Recommendations */}
        {!isUser && message.products && message.products.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            {message.products.map((product) => (
              <ProductRecommendationCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-zinc-600 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Simple markdown-like renderer for bold text and line breaks
 */
const MessageContent = ({ text }) => {
  if (!text) return null;

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, pIdx) => {
        // Split by single newlines for line breaks
        const lines = paragraph.split(/\n/);

        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineFormatting(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Render bold and inline formatting
 */
const renderInlineFormatting = (text) => {
  // Match **bold** patterns
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default ChatMessage;
