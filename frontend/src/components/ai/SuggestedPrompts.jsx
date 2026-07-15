import { motion } from "framer-motion";
import { Sparkles, Search, Gift, TrendingUp } from "lucide-react";

const prompts = [
  {
    icon: Search,
    text: "Show me leather handbags",
    color: "from-amber-500/20 to-amber-600/10",
  },
  {
    icon: TrendingUp,
    text: "What's trending right now?",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: Gift,
    text: "Help me find a gift under ₹10,000",
    color: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    icon: Sparkles,
    text: "Recommend a luxury tote bag",
    color: "from-rose-500/20 to-rose-600/10",
  },
];

const SuggestedPrompts = ({ onSelect }) => {
  return (
    <div className="px-4 pb-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3 font-medium">
        Try asking
      </p>
      <div className="grid grid-cols-1 gap-2">
        {prompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
            onClick={() => onSelect(prompt.text)}
            className={`
              group flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl
              bg-linear-to-r ${prompt.color}
              border border-white/5 hover:border-amber-500/30
              text-left transition-all duration-300
              hover:scale-[1.02] active:scale-[0.98]
              cursor-pointer
            `}
          >
            <prompt.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-amber-500 transition-colors shrink-0" />
            <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
              {prompt.text}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
