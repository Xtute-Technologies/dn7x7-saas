"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";

import { activateAccount } from "@/services/authService";

export default function ActivationPage({ params }) {
  const { uid, token } = use(params);
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const activate = async () => {
      try {
        await activateAccount(uid, token);
        setStatus("success");
      } catch (error) {
        console.error("Activation failed", error);
        setStatus("error");
      }
    };
    
    // Slight delay for better UX (prevents flash)
    const timeout = setTimeout(() => {
        activate();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [uid, token]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl">Account Activation</CardTitle>
            <CardDescription>
                Verifying your account details...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
            
            {status === "loading" && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Please wait while we activate your account.</p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-green-700">Activation Successful!</h3>
                        <p className="text-sm text-muted-foreground">Your account has been verified. You can now log in.</p>
                    </div>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="bg-red-100 p-3 rounded-full">
                        <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-red-700">Activation Failed</h3>
                        <p className="text-sm text-muted-foreground">This link may be invalid or expired.</p>
                    </div>
                </>
            )}

          </CardContent>
          <CardFooter>
            {status !== "loading" && (
                <Button asChild className="w-full">
                    <Link href="/login">Go to Login</Link>
                </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}