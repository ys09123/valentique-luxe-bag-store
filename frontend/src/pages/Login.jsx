import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((res) => setTimeout(res, 800));

    const result = await login(formData);

    if (result.success) {
      showToast(`Welcome back, ${result.user.name}!`, "success");
      navigate("/");
    }
    else {
      setError(result.message);
      showToast(result.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden text-zinc-100">
      
      {/* 1. Ambient Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium"
          >
            Members Area
          </motion.p>
          <h1 className="text-4xl font-light text-white tracking-wide">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-400 font-light tracking-wide">
            Sign in to access your exclusive collection
          </p>
        </div>

        {/* Form Card with Glassmorphism */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
          
          {/* Subtle shimmer effect on card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Email Field */}
            <div className="space-y-2 group/input">
              <Label htmlFor="email" className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-12 h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-light tracking-wide rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group/input">
              <div className="flex justify-between items-center">
                <Label htmlFor="password"
                className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-[10px] tracking-[0.1em] text-zinc-500 hover:text-amber-400 transition-colors uppercase cursor-pointer hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-12 pr-12 h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-light tracking-wide rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
                <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-400 text-xs text-center tracking-wide bg-red-900/20 p-2 rounded border border-red-900/50"
                >
                    {error}
                </motion.p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium text-xs tracking-[0.2em] uppercase transition-all rounded-xl relative overflow-hidden cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] text-zinc-600 tracking-[0.2em] uppercase">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Guest Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full h-12 bg-transparent border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 text-zinc-400 hover:text-amber-200 font-medium text-xs tracking-[0.2em] uppercase transition-all rounded-xl cursor-pointer"
          >
            Continue as Guest
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-8 font-light tracking-wide">
          New here?{" "}
          <Link to="/register" className="text-amber-500 hover:underline font-medium">
              Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;