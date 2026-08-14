import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, ShieldCheck, Loader2, ArrowRight, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/toastContext";

// Two-screen OTP login: enter email -> enter 6-digit code.
// Reuses the same AuthContext session state (user/token/localStorage)
// as the password login flow, so nothing downstream needs to know
// which method the user signed in with.
const OtpLoginForm = () => {
  const { showToast } = useToast();
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const result = await sendOtp(email);

    if (result.success) {
      showToast("OTP sent — check your inbox", "success");
      setStep("otp");
      setCooldown(60);
    } else {
      setError(result.message);
      showToast(result.message, "error");
      if (result.status === 429 && result.retryAfter) {
        setStep("otp");
        setCooldown(result.retryAfter);
      }
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyOtp(email, otp);

    if (result.success) {
      showToast(`Welcome, ${result.user.name}!`, "success");
      navigate("/");
    } else {
      setError(result.message);
      showToast(result.message, "error");
      setOtp("");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await handleSendOtp();
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-6 relative z-10">
        <div className="space-y-2 group/input">
          <Label
            htmlFor="otp-email"
            className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within/input:text-white transition-colors" />
            <Input
              id="otp-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-light tracking-wide rounded-xl"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center tracking-wide bg-red-900/20 p-2 rounded border border-red-900/50">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium text-xs tracking-[0.2em] uppercase transition-all rounded-xl relative overflow-hidden cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Send OTP <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
      <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-zinc-500">
        <span>
          Code sent to{" "}
          <span className="text-zinc-300 normal-case tracking-normal">
            {email}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setOtp("");
            setError("");
          }}
          className="flex items-center gap-1 text-amber-500 hover:underline cursor-pointer"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
      </div>

      <div className="space-y-2 group/input">
        <Label
          htmlFor="otp-code"
          className="text-[10px] tracking-[0.15em] uppercase text-zinc-500 group-focus-within/input:text-amber-500 transition-colors"
        >
          6-Digit Code
        </Label>
        <div className="relative">
          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within/input:text-white transition-colors" />
          <Input
            id="otp-code"
            name="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="pl-12 h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all font-light tracking-[0.3em] text-center rounded-xl"
            required
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs text-center tracking-wide bg-red-900/20 p-2 rounded border border-red-900/50">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium text-xs tracking-[0.2em] uppercase transition-all rounded-xl relative overflow-hidden cursor-pointer"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            Verify OTP <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0}
        className="w-full text-center text-[10px] tracking-widest uppercase text-zinc-500 hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </button>
    </form>
  );
};

export default OtpLoginForm;
