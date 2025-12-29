// app/account/page.tsx
"use client";

import { useUserProfile, useUpdateUserProfile } from "@/hooks/use-user-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImageUpload from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LocationPicker from "@/components/location-picker";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Loader2,
  User as UserIcon,
  MapPin,
  Mail,
  Calendar,
  Check,
  X,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteAccount } from "@/hooks/use-user-profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { data: profile, isLoading, error } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
  });
  const deleteAccount = useDeleteAccount();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      signOut({ callbackUrl: "/" });
    } catch (error) {
      alert("Failed to delete account");
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {}
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Failed to load profile: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const hasPassword = profile.hasPassword;
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Header */}
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information
          </p>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            {!profile.emailVerified && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Email not verified</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please check your inbox for a verification email.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            "/api/auth/resend-verification",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: profile.email }),
                            }
                          );
                          if (response.ok) {
                            alert("Verification email sent!");
                          }
                        } catch (error) {
                          alert("Failed to send email");
                        }
                      }}
                    >
                      Resend Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <CardContent className="space-y-6">
              {/* Profile Image */}
              {isEditing ? (
                <div className="flex flex-col items-center py-4">
                  <ImageUpload
                    currentImage={profile.image || undefined}
                    onUploadSuccess={(imageUrl) => {
                      queryClient.invalidateQueries({
                        queryKey: ["user-profile"],
                      });
                    }}
                    onUploadError={(error) => {
                      alert(error);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name || "Profile"}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile.name || "No name set"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.email}
                    </p>
                    {profile.username && (
                      <p className="text-sm text-muted-foreground">
                        @{profile.username}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Your unique username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full min-h-25 px-3 py-2 rounded-md border bg-background text-sm resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <LocationPicker
                      value={formData.location}
                      onChange={(value) =>
                        setFormData({ ...formData, location: value })
                      }
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfile.isPending}
                    >
                      <X />
                      Cancel
                    </Button>
                  </div>

                  {updateProfile.isError && (
                    <p className="text-sm text-destructive">
                      {updateProfile.error?.message}
                    </p>
                  )}
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="size-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="flex items-start space-x-3">
                      <UserIcon className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Bio</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.bio}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.location && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.location}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Calendar className="size-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasPassword ? (
                <>
                  {!showPasswordForm ? (
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Lock className="size-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">
                            Last changed recently
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      {passwordSuccess && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                          <Check className="size-4" />
                          Password changed successfully!
                        </div>
                      )}

                      {passwordError && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                          {passwordError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label
                          htmlFor="currentPassword"
                          className="text-sm font-medium"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            required
                            disabled={passwordLoading}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="newPassword"
                          className="text-sm font-medium"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            required
                            disabled={passwordLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          At least 6 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                            disabled={passwordLoading}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={passwordLoading}>
                          {passwordLoading ? (
                            <>
                              <Loader2 className="animate-spin" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <Check />
                              Change Password
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                            setPasswordError("");
                            setPasswordSuccess(false);
                          }}
                          disabled={passwordLoading}
                        >
                          <X />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    You signed in with OAuth (Google/GitHub). Password
                    management is not available for OAuth accounts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {profile.emailVerified ? "✅ Yes" : "❌ No"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profile Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Delete Account Section */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers,
                  including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your profile information</li>
                  <li>All your posts</li>
                  <li>All your comments</li>
                  <li>All your reactions</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete my account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
