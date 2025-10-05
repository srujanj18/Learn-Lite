import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, UserPlus, Eye, EyeOff, User, Phone, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/ToastContext";
import { signInWithEmail, signUpWithEmail, sendPasswordReset, signOutUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
        showSuccess("Password reset email sent. Please check your inbox.");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        if (!username.trim()) {
          throw new Error("Username is required");
        }
        if (!phoneNumber.trim()) {
          throw new Error("Phone number is required");
        }
        await signUpWithEmail(email, password, username, phoneNumber, profilePicture);
        showSuccess("Account created successfully. Please check your email for verification.");
        navigate("/");
      } else {
        await signInWithEmail(email, password);
        showSuccess("Logged in successfully");
        navigate("/");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.code === 'auth/email-already-in-use') {
        showError("This email is already registered. Please try signing in instead.");
      } else if (error.code === 'auth/weak-password') {
        showError("Password should be at least 6 characters long.");
      } else if (error.code === 'auth/invalid-email') {
        showError("Please enter a valid email address.");
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        showError("Invalid email or password.");
      } else if (error.code === 'auth/too-many-requests') {
        showError("Too many failed attempts. Please try again later.");
      } else {
        showError(error.message || `Failed to ${isSignUp ? 'create account' : isForgotPassword ? 'reset password' : 'login'}`);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-lg"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isForgotPassword ? "Enter your email to reset password" : isSignUp ? "Sign up for a new account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-picture" className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-accent">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span>Upload Profile Picture</span>
                </Label>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  className="hidden"
                />
                {profilePicture && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {profilePicture.name}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              isForgotPassword ? "Sending reset link..." : isSignUp ? "Creating account..." : "Signing in..."
            ) : (
              <>
                {isForgotPassword ? <Mail className="mr-2 h-4 w-4" /> : isSignUp ? <UserPlus className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                {isForgotPassword ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
              </>
            )}
          </Button>



          <div className="text-center text-sm space-y-2">
            {!isForgotPassword && (
              <button
                type="button"
                className="text-primary hover:underline block w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            )}
            <button
              type="button"
              className="text-primary hover:underline block w-full"
              onClick={() => {
                setIsForgotPassword(!isForgotPassword);
                setIsSignUp(false);
              }}
            >
              {isForgotPassword ? "Back to Sign In" : "Forgot Password?"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;