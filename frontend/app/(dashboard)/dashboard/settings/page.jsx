"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import * as authService from "@/services/authService";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const MAX_FILE_SIZE = 5000000; // Adjusted to 5MB to match your error message text
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organization: z.string().optional(),
  profile_image: z
    .any()
    .refine(
      (files) => (files?.length > 0 ? files[0].size <= MAX_FILE_SIZE : true),
      `Max image size is 5MB.`
    )
    .refine(
      (files) =>
        files?.length > 0 ? ACCEPTED_IMAGE_TYPES.includes(files[0].type) : true,
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    re_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.re_new_password, {
    message: "New passwords don't match",
    path: ["re_new_password"],
  });

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Create a ref for the file input to trigger it programmatically
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      organization: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // 1. Sync Form & Preview with User Data when it loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        organization: user.organization || "",
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setPreviewUrl(user.profile_image);
    }
  }, [user, reset]);

  // 2. Custom handler to update preview immediately
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. Register the file input manually to handle Refs and onChange
  const { ref: registerRef, onChange: registerOnChange, ...fileRegisterRest } = register("profile_image");

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("organization", data.organization || "");
    
    // Check if a new file exists in the FileList
    if (data.profile_image && data.profile_image.length > 0) {
      formData.append("profile_image", data.profile_image[0]);
    }

    try {
      const response = await authService.updateUser(formData);
      
      // Update global context
      if (setUser) {
        setUser(response.data);
      }
      
      setSuccessMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordSuccessMessage("");
    setPasswordErrorMessage("");
    try {
      await authService.changePassword(data);
      setPasswordSuccessMessage("Password changed successfully!");
      resetPassword();
      setTimeout(() => setPasswordSuccessMessage(""), 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.current_password?.[0] ||
        "Failed to change password. Please check your current password.";
      setPasswordErrorMessage(errorMsg);
      console.error("Failed to change password", error);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {successMessage && (
                <div className="text-green-500 text-sm text-center font-medium bg-green-50 p-2 rounded">
                  {successMessage}
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24 border">
                  {/* Show previewUrl if available, otherwise show nothing (fallback handles init) */}
                  <AvatarImage src={previewUrl} alt="Profile Preview" />
                  <AvatarFallback className="text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                  
                  {/* Hidden Input with Merged Refs and Handlers */}
                  <Input
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    {...fileRegisterRest}
                    ref={(e) => {
                      registerRef(e); // Pass ref to React Hook Form
                      fileInputRef.current = e; // Pass ref to our local useRef
                    }}
                    onChange={(e) => {
                      registerOnChange(e); // Notify React Hook Form
                      handleImageChange(e); // Update Local Preview
                    }}
                  />
                  
                  {errors.profile_image && (
                    <FieldError className="text-red-500 text-sm">
                      {errors.profile_image.message}
                    </FieldError>
                  )}
                </div>
              </div>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={user?.email || ""} readOnly disabled className="cursor-not-allowed bg-gray-100" />
              </Field>

              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input {...register("name")} placeholder="Your Name" />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Organization</FieldLabel>
                <Input {...register("organization")} placeholder="Your Organization" />
                {errors.organization && (
                  <FieldError>{errors.organization.message}</FieldError>
                )}
              </Field>

              <div className="flex items-center space-x-2">
                <Button type="submit">Save Changes</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current and new password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                      <div className="grid gap-4 py-4">
                        {passwordSuccessMessage && (
                          <div className="text-green-500 text-sm text-center font-medium bg-green-50 p-2 rounded">
                            {passwordSuccessMessage}
                          </div>
                        )}
                        {passwordErrorMessage && (
                          <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                            {passwordErrorMessage}
                          </div>
                        )}
                        <Field>
                          <FieldLabel htmlFor="current_password">
                            Current Password
                          </FieldLabel>
                          <Input
                            id="current_password"
                            type="password"
                            {...registerPassword("current_password")}
                          />
                          {passwordErrors.current_password && (
                            <FieldError>
                              {passwordErrors.current_password.message}
                            </FieldError>
                          )}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="new_password">
                            New Password
                          </FieldLabel>
                          <Input
                            id="new_password"
                            type="password"
                            {...registerPassword("new_password")}
                          />
                          {passwordErrors.new_password && (
                            <FieldError>
                              {passwordErrors.new_password.message}
                            </FieldError>
                          )}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="re_new_password">
                            Confirm New Password
                          </FieldLabel>
                          <Input
                            id="re_new_password"
                            type="password"
                            {...registerPassword("re_new_password")}
                          />
                          {passwordErrors.re_new_password && (
                            <FieldError>
                              {passwordErrors.re_new_password.message}
                            </FieldError>
                          )}
                        </Field>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save password</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}