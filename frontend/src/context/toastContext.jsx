import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  // Function to trigger the alert
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* The Alert UI Overlay */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`
                pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md min-w-[300px]
                ${toast.type === "success" 
                  ? "bg-zinc-900/90 border-emerald-500/20 text-white" 
                  : "bg-zinc-900/90 border-red-500/20 text-white"}
              `}
            >
              {/* Icon */}
              <div className={`p-2 rounded-full ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                {toast.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>

              {/* Message */}
              <div className="flex-1">
                <h4 className="text-sm font-medium tracking-wide">
                  {toast.type === "success" ? "Success" : "Error"}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>
              </div>

              {/* Close Button */}
              <button onClick={hideToast} className="text-zinc-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};