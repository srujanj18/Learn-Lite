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
    <div className="page-shell">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div className="hero-copy">
          <p className="eyebrow">Settings</p>
          <h1 className="hero-title">Manage your <span>profile</span></h1>
          <p className="hero-text">Update your account details in one simple form.</p>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="content-card panel">
        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
          <Field icon={User} label="Display name">
            <Input name="displayName" value={profile.displayName} onChange={handleChange} placeholder="Your name" className="input-surface pl-12" />
          </Field>

          <Field icon={Mail} label="Email address">
            <Input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="you@example.com" className="input-surface pl-12" />
          </Field>

          <div className="lg:col-span-2">
            <Field icon={User} label="Bio">
              <Textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Tell us a little about yourself" className="textarea-surface pl-4" />
            </Field>
          </div>

          <Field icon={Key} label="New password">
            <Input type="password" name="newPassword" value={profile.newPassword} onChange={handleChange} placeholder="Leave blank to keep current password" className="input-surface pl-12" />
          </Field>

          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="h-12 w-full">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving" : "Save changes"}
            </Button>
          </div>
        </form>
      </motion.section>
    </div>
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

export default Settings;
