import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Key, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/ToastContext";
import { getProfile, updateUserProfile } from "@/lib/profileService";
import { useTranslation } from "@/lib/i18n";

const Account = () => {
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    bio: '',
    photoURL: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getProfile();
      setProfile(prev => ({
        ...prev,
        ...userProfile
      }));
    } catch (error) {
      showError("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await updateUserProfile(profile);
      setProfile(prev => ({
        ...prev,
        ...updatedProfile,
        newPassword: '' // Clear password field after successful update
      }));
      showSuccess("Profile updated successfully");
    } catch (error) {
      const errorMessage = error.message || "Failed to update profile";
      showError(errorMessage);
      // Reload original profile on error
      loadProfile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Account Settings
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
              className="pl-10"
              placeholder="Your display name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="pl-10"
              placeholder="Your email address"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              name="newPassword"
              value={profile.newPassword}
              onChange={handleChange}
              className="pl-10"
              placeholder="Enter new password"
            />
          </div>
          <p className="text-sm text-muted-foreground">Leave blank to keep current password</p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default Account;