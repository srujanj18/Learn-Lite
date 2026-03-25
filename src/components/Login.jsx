import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  User,
  Phone,
  Upload,
  Sparkles,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/ToastContext";
import { signInWithEmail, signUpWithEmail, sendPasswordReset } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordReset(email);
        showSuccess("Password reset email sent");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        await signUpWithEmail(email, password, username, phoneNumber, profilePicture);
        showSuccess("Account created successfully");
        navigate("/");
      } else {
        await signInWithEmail(email, password);
        showSuccess("Logged in successfully");
        navigate("/");
      }
    } catch (error) {
      showError(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header glow-box lava-border"
        >
          <p className="eyebrow">
            <Flame size={14} />
            LearnLite Access
          </p>
          <h1 className="hero-title">
            Enter a <span>cleaner AI workspace</span>
          </h1>
          <p className="hero-text">
            A more professional interface, a calmer system, and one place to work across AI chat, document review,
            image generation, and data exploration.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: "Modern visual system", text: "Refined dark palette with controlled orange glow." },
              { icon: ShieldCheck, title: "Secure access", text: "Account flows remain protected while the UI feels more premium." },
              { icon: User, title: "Focused workspace", text: "The app now centers faster, more readable task flows." },
            ].map((item) => (
              <div key={item.title} className="metric-card">
                <item.icon className="h-5 w-5 text-[#FF8C42]" />
                <p className="mt-4 text-base font-semibold text-white">{item.title}</p>
                <p className="metric-subtext">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="glow-box lava-border p-8"
        >
          <div className="mb-8">
            <p className="eyebrow">Authentication</p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              {isForgotPassword ? "Reset your password" : isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="section-copy mt-3">
              {isForgotPassword
                ? "We’ll send you a reset link so you can get back into your workspace."
                : isSignUp
                  ? "Set up your LearnLite profile and start using the redesigned platform."
                  : "Sign in to continue with your AI workspace."}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="stack">
            {isSignUp && (
              <>
                <InputField icon={User} placeholder="Username" value={username} onChange={setUsername} />
                <InputField icon={Phone} placeholder="Phone Number" value={phoneNumber} onChange={setPhoneNumber} />
                <div>
                  <Label className="muted-label mb-3 block">Profile picture</Label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[rgba(255,120,50,0.18)] bg-[rgba(255,255,255,0.02)] px-4 py-4 transition hover:bg-[rgba(255,80,0,0.05)]">
                    <Upload className="h-5 w-5 text-[#FF8C42]" />
                    <span className="text-sm text-[rgba(237,237,237,0.82)]">{profilePicture ? profilePicture.name : "Upload image"}</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </>
            )}

            <InputField icon={Mail} placeholder="Email address" value={email} onChange={setEmail} type="email" />

            {!isForgotPassword && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FF8C42]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-surface pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(237,237,237,0.6)] transition hover:text-[#FF8C42]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full">
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  {isForgotPassword ? <Mail className="mr-2 h-4 w-4" /> : isSignUp ? <UserPlus className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {isForgotPassword ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
                </>
              )}
            </Button>

            <div className="space-y-2 pt-2 text-center text-sm text-[rgba(237,237,237,0.62)]">
              {!isForgotPassword && (
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="transition hover:text-[#FF8C42]">
                  {isSignUp ? "Already have an account? Sign in" : "Don’t have an account? Sign up"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(!isForgotPassword);
                  setIsSignUp(false);
                }}
                className="block w-full transition hover:text-[#FF8C42]"
              >
                {isForgotPassword ? "Back to Sign In" : "Forgot Password?"}
              </button>
            </div>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, value, onChange, placeholder, type = "text" }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FF8C42]" />
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-surface pl-12"
      required
    />
  </div>
);

export default Login;
