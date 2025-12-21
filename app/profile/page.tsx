// app/profile/page.tsx
"use client";

import { useUserProfile, useUpdateUserProfile } from "@/hooks/use-user-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LocationPicker from "@/components/location-picker";
import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  User as UserIcon,
  MapPin,
  Mail,
  Calendar,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { data: profile, isLoading, error } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  // Initialize form data when profile loads
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
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
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

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information
            </p>
          </div>

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
                </div>
              </div>

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
        </div>
      </div>
    </div>
  );
}
