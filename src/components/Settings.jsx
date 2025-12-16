import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Key, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/ToastContext";
import { getProfile, updateUserProfile } from "@/lib/profileService";

const Settings = () => {
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    bio: "",
    photoURL: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile((prev) => ({ ...prev, ...data }));
    } catch {
      showError("Failed to load profile");
    }
  };

  // ✅ JSX-safe handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await updateUserProfile(profile);
      setProfile((prev) => ({
        ...prev,
        ...updated,
        newPassword: "",
      }));
      showSuccess("Profile updated successfully");
    } catch (err) {
      showError(err?.message || "Profile update failed");
      loadProfile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        max-w-3xl mx-auto
        relative rounded-3xl p-8
        bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950
        border border-indigo-700/40
        shadow-2xl shadow-indigo-900/40
      "
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="
          p-3 rounded-xl
          bg-gradient-to-br from-indigo-600 to-blue-600
          shadow-lg shadow-indigo-700/60
        ">
          <User className="h-5 w-5 text-slate-900" />
        </div>

        <h2 className="
          text-2xl font-bold tracking-wide
          bg-gradient-to-r from-indigo-400 to-blue-400
          bg-clip-text text-transparent
        ">
          Account Neural Interface
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="text-sm text-indigo-300">Display Name</label>
          <div className="relative mt-2">
            <User className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
            <Input
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
              placeholder="Neural identity"
              className="
                pl-10 rounded-xl
                bg-slate-900
                border border-indigo-700/40
                text-indigo-200
                placeholder:text-indigo-400/70
                focus:ring-2 focus:ring-indigo-500
                transition-all
              "
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-indigo-300">Email Address</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
            <Input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="you@neural.ai"
              className="
                pl-10 rounded-xl
                bg-slate-900
                border border-blue-700/40
                text-blue-200
                placeholder:text-blue-400/70
                focus:ring-2 focus:ring-blue-500
                transition-all
              "
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm text-indigo-300">Bio</label>
          <Textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Describe your intelligence core..."
            className="
              mt-2 rounded-xl min-h-[120px]
              bg-slate-900
              border border-indigo-700/40
              text-indigo-200
              placeholder:text-indigo-400/70
              focus:ring-2 focus:ring-indigo-500
              transition-all
            "
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-indigo-300">New Password</label>
          <div className="relative mt-2">
            <Key className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
            <Input
              type="password"
              name="newPassword"
              value={profile.newPassword}
              onChange={handleChange}
              placeholder="Encrypted key"
              className="
                pl-10 rounded-xl
                bg-slate-900
                border border-indigo-700/40
                text-indigo-200
                placeholder:text-indigo-400/70
                focus:ring-2 focus:ring-indigo-500
                transition-all
              "
            />
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 rounded-xl
              font-semibold tracking-wide
              bg-gradient-to-r from-indigo-600 to-blue-600
              hover:from-indigo-500 hover:to-blue-500
              text-slate-900
              shadow-lg shadow-indigo-700/50
              transition-all duration-300
            "
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Synchronizing..." : "Sync Neural Profile"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Settings;
