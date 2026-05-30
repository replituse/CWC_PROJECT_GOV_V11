import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASS = "Demo@123";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      setLocation("/designer");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "email" | "pass") => {
    await navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">

        {/* Logo / Title */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            WHAMO <span className="text-blue-600">Designer</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>
            Hydraulic Network Analysis
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder="you@example.com"
                data-testid="input-email"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                style={{ fontFamily: "Poppins, sans-serif" }}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500" style={{ fontFamily: "Poppins, sans-serif" }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  data-testid="input-password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors ${errors.password ? "border-red-400 bg-red-50" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500" style={{ fontFamily: "Poppins, sans-serif" }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="button-submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500 mt-5" style={{ fontFamily: "Poppins, sans-serif" }}>
            Don't have an account?{" "}
            <button
              onClick={() => setLocation("/register")}
              className="text-blue-600 font-semibold hover:underline"
              data-testid="link-register"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Demo Account Card */}
        <div className="bg-white rounded-2xl shadow border border-blue-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider" style={{ fontFamily: "Poppins, sans-serif" }}>
                Demo Account
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>For demonstration and testing only</p>
            </div>
            <button
              onClick={fillDemo}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              style={{ fontFamily: "Poppins, sans-serif" }}
              data-testid="button-fill-demo"
            >
              Use Demo
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide" style={{ fontFamily: "Poppins, sans-serif" }}>Email</p>
                <p className="text-sm text-slate-700 font-mono mt-0.5">{DEMO_EMAIL}</p>
              </div>
              <button
                onClick={() => copyToClipboard(DEMO_EMAIL, "email")}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="Copy email"
                data-testid="button-copy-email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide" style={{ fontFamily: "Poppins, sans-serif" }}>Password</p>
                <p className="text-sm text-slate-700 font-mono mt-0.5">{DEMO_PASS}</p>
              </div>
              <button
                onClick={() => copyToClipboard(DEMO_PASS, "pass")}
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="Copy password"
                data-testid="button-copy-password"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
