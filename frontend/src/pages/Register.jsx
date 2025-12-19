import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { useToast } from "../context/toastContext";

const Register = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 1. Frontend Validation: Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // 2. Prepare data for API (Exclude confirmPassword)
    const userData = {
      name: formData.fullName, 
      email: formData.email.toLowerCase(),
      password: formData.password,
    };

    // 3. Call AuthContext Register
    const result = await register(userData);

    if (result.success) {
      // --- LOGGING USERNAME HERE ---
      showToast("Account created successfully!", "success");
      navigate("/");
    } else {
      // Handle API errors (e.g., "Email already exists")
      setError(result.message);
      showToast(result.message, "error");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden text-zinc-100">
      
      {/* Ambient Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium"
          >
            Membership
          </motion.p>
          <h1 className="text-3xl font-light text-white tracking-wide">
            Create Account
          </h1>
          <p className="text-sm text-zinc-400 font-light tracking-wide">
            Join our exclusive community today
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
          
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* Full Name Field */}
            <div className="space-y-2 group/input">
              <Label htmlFor="fullName" className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-12 h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-light tracking-wide rounded-xl"
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors">
                Password
              </Label>
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
                  minLength={6}
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

             {/* Confirm Password Field */}
             <div className="space-y-2 group/input">
              <Label htmlFor="confirmPassword" className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-12 h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-light tracking-wide rounded-xl"
                  required
                />
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
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium text-xs tracking-[0.2em] uppercase transition-all rounded-xl relative overflow-hidden cursor-pointer mt-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-500 mt-8 font-light tracking-wide">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors underline-offset-4 hover:underline">
                Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;