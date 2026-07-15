import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X } from "lucide-react";
import ChatWindow from "./ChatWindow";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="
              fixed bottom-6 right-4 sm:right-6 z-[60]
              w-14 h-14
              rounded-full
              bg-gradient-to-br from-amber-500 to-amber-600
              text-black
              shadow-[0_8px_30px_rgba(245,158,11,0.3),0_2px_8px_rgba(0,0,0,0.3)]
              flex items-center justify-center
              cursor-pointer
              group
              border border-amber-400/20
            "
            aria-label="Open AI Shopping Assistant"
          >
            <MessageSquareText className="h-6 w-6 group-hover:scale-110 transition-transform" />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping opacity-40" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile (dismissible) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] sm:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
