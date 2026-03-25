import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Key, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/ToastContext";
import { getProfile, updateUserProfile } from "@/lib/profileService";

const Account = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await updateUserProfile(profile);
      setProfile((prev) => ({ ...prev, ...updated, newPassword: "" }));
      showSuccess("Profile updated successfully");
    } catch (err) {
      showError(err?.message || "Profile update failed");
      loadProfile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="content-card panel max-w-3xl">
      <p className="eyebrow">
        <Sparkles size={14} />
        Account
      </p>
      <h2 className="mt-4 text-3xl font-bold text-white">Profile management</h2>
      <p className="section-copy mt-2">This standalone account view now matches the molten orange workspace system.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <Field icon={User} label="Display Name">
          <Input name="displayName" value={profile.displayName} onChange={handleChange} placeholder="Your name" className="input-surface pl-12" />
        </Field>

        <Field icon={Mail} label="Email Address">
          <Input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="you@example.com" className="input-surface pl-12" />
        </Field>

        <Field icon={User} label="Bio">
          <Textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Describe how you use LearnLite" className="textarea-surface" />
        </Field>

        <Field icon={Key} label="New Password">
          <Input type="password" name="newPassword" value={profile.newPassword} onChange={handleChange} placeholder="Leave blank to keep the current password" className="input-surface pl-12" />
        </Field>

        <Button type="submit" disabled={loading} className="h-12 w-full">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving" : "Save Profile"}
        </Button>
      </form>
    </motion.div>
  );
};

const Field = ({ icon: Icon, label, children }) => (
  <label className="block">
    <span className="muted-label mb-3 block">{label}</span>
    <div className="relative">
      <Icon className="absolute left-4 top-4 h-5 w-5 text-[#FF8C42]" />
      {children}
    </div>
  </label>
);

export default Account;
