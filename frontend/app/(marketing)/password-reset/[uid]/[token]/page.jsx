"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner"; // Assuming you use Sonner
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { resetPasswordConfirmSchema } from "@/schemas/auth";
import { resetPasswordConfirm } from "@/services/authService";

export default function ResetPasswordConfirmPage({ params }) {
  const { uid, token } = use(params);

  const router = useRouter();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordConfirmSchema),
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await resetPasswordConfirm({
        uid,
        token,
        new_password: data.new_password,
        re_new_password: data.re_new_password,
      });

      toast.success("Password reset successful!");
      router.push("/login");
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        // Handle common Djoser error formats
        if (errorData.uid || errorData.token) {
          setApiError("Invalid or expired reset link.");
        } else if (errorData.new_password) {
          setApiError(errorData.new_password.join(" "));
        } else {
          setApiError("Failed to reset password. Please try again.");
        }
      } else {
        setApiError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Set New Password</CardTitle>
            <CardDescription>Please enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {apiError && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{apiError}</div>}

              <Field>
                <FieldLabel htmlFor="new_password">New Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="new_password" type="password" className="pl-8" {...register("new_password")} />
                </div>
                {errors.new_password && <FieldError>{errors.new_password.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="re_new_password">Confirm Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="re_new_password" type="password" className="pl-8" {...register("re_new_password")} />
                </div>
                {errors.re_new_password && <FieldError>{errors.re_new_password.message}</FieldError>}
              </Field>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
