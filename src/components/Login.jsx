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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/ToastContext";
import {
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
} from "@/lib/auth";
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
        await signUpWithEmail(
          email,
          password,
          username,
          phoneNumber,
          profilePicture
        );
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          w-full max-w-md
          rounded-3xl p-8
          bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950
          border border-indigo-700/40
          shadow-2xl shadow-indigo-900/40
        "
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="
            text-3xl font-bold
            bg-gradient-to-r from-indigo-400 to-blue-400
            bg-clip-text text-transparent
          ">
            {isForgotPassword
              ? "Reset Password"
              : isSignUp
              ? "Create Account"
              : "Welcome Back"}
          </h2>
          <p className="text-indigo-400 text-sm mt-2">
            {isForgotPassword
              ? "Receive a password reset link"
              : isSignUp
              ? "Create your AI-powered account"
              : "Sign in to continue"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {isSignUp && (
            <>
              <InputField
                icon={User}
                placeholder="Username"
                value={username}
                onChange={setUsername}
              />
              <InputField
                icon={Phone}
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />

              <div>
                <Label className="text-indigo-300 text-sm mb-2 block">
                  Profile Picture
                </Label>
                <label className="
                  flex items-center gap-3 p-3 rounded-xl
                  bg-slate-900 border border-indigo-700/40
                  cursor-pointer hover:bg-slate-800
                ">
                  <Upload className="text-indigo-400" />
                  <span className="text-indigo-200 text-sm">
                    {profilePicture ? profilePicture.name : "Upload image"}
                  </span>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setProfilePicture(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
            </>
          )}

          <InputField
            icon={Mail}
            placeholder="Email address"
            value={email}
            onChange={setEmail}
            type="email"
          />

          {!isForgotPassword && (
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  pl-10 pr-10 h-11 rounded-xl
                  bg-slate-900 border border-indigo-700/40
                  text-indigo-200
                  focus:ring-2 focus:ring-indigo-500
                "
                required
              />
              <Lock className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-indigo-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 rounded-xl
              bg-gradient-to-r from-indigo-600 to-blue-600
              hover:from-indigo-500 hover:to-blue-500
              text-slate-900 font-semibold
              shadow-lg shadow-indigo-700/40
            "
          >
            {loading ? "Please wait..." : (
              <>
                {isForgotPassword
                  ? <Mail className="mr-2" />
                  : isSignUp
                  ? <UserPlus className="mr-2" />
                  : <LogIn className="mr-2" />}
                {isForgotPassword
                  ? "Send Reset Link"
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </>
            )}
          </Button>

          {/* Links */}
          <div className="text-center text-sm space-y-2 text-indigo-400">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="hover:text-indigo-300"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(!isForgotPassword);
                setIsSignUp(false);
              }}
              className="hover:text-indigo-300 block w-full"
            >
              {isForgotPassword ? "Back to Sign In" : "Forgot Password?"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ---------------- Reusable Input ---------------- */

const InputField = ({ icon: Icon, value, onChange, placeholder, type = "text" }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        pl-10 h-11 rounded-xl
        bg-slate-900 border border-indigo-700/40
        text-indigo-200
        focus:ring-2 focus:ring-indigo-500
      "
      required
    />
  </div>
);

export default Login;
