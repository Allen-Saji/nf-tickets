"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";
import { Particles } from "@/components/magicui/particles";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CreateArtistProfileForm from "@/components/artist/create-profile-form";
import { api } from "@/trpc/react";

// Define the form validation schema for fans
const FanSignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type FanSignupFormData = z.infer<typeof FanSignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [signupType, setSignupType] = useState<"initial" | "fan" | "artist">(
    "initial"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<FanSignupFormData>({
    resolver: zodResolver(FanSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Use the register mutation from your TRPC router
  const registerMutation = api.user.register.useMutation({
    onSuccess: () => {
      toast.success("Account Created", {
        description: "Your fan account has been created successfully.",
        duration: 5000,
        className: "bg-[#1a1d2d] border-green-500 text-white",
      });
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Error Creating Account", {
        description: error.message || "Failed to create your fan account",
        duration: 5000,
        action: {
          label: "Try Again",
          onClick: () => form.handleSubmit(handleFanSignup)(),
        },
      });
    },
  });

  const handleFanSignup = async (data: FanSignupFormData) => {
    try {
      setIsSubmitting(true);

      // Call the register mutation from your TRPC router
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Note: The toast and redirect are handled in the onSuccess callback
    } catch (error) {
      // Error handling is in the onError callback
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Authentication
  const handleGoogleAuth = async () => {
    try {
      setIsGoogleAuth(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Authentication Failed", {
        description: "Failed to authenticate with Google",
        duration: 5000,
      });
      setIsGoogleAuth(false);
    }
  };

  // Render different content based on signup type
  const renderContent = () => {
    if (signupType === "artist") {
      return <CreateArtistProfileForm />;
    }

    return (
      <div className="flex items-center justify-center bg-black text-white min-h-screen overflow-hidden">
        <Card className="w-full max-w-xl bg-[#10121f] border border-gray-800 rounded-lg shadow-xl z-10">
          <CardContent className="pt-6 pb-8">
            {signupType === "initial" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold mb-6">
                  Create <span className="text-[#DEFF58]">Account</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  Choose how you want to join our platform
                </p>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <Button
                    onClick={() => setSignupType("fan")}
                    className="bg-[#1a1d2d] text-white border border-gray-700 hover:bg-[#262a3d] hover:text-[#DEFF58] h-12 font-medium"
                  >
                    Sign up as a Fan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    onClick={() => setSignupType("artist")}
                    className="bg-[#DEFF58] text-black hover:bg-[#f0ff85] hover:scale-[1.02] transition-all duration-300 h-12 font-medium"
                  >
                    Sign up as an Artist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <p className="text-center text-gray-500 text-sm pt-4">
                  Already have an account?{" "}
                  <a href="/login" className="text-[#DEFF58] hover:underline">
                    Log in
                  </a>
                </p>
              </div>
            )}

            {signupType === "fan" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">
                    <span className="text-[#DEFF58]">Fan</span> Signup
                  </h1>
                  <Button
                    variant="ghost"
                    onClick={() => setSignupType("initial")}
                    className="text-gray-400 hover:text-white"
                  >
                    Back
                  </Button>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleFanSignup)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 text-sm font-medium">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="Enter your name"
                                {...field}
                                className="bg-[#1a1d2d] border-gray-700 h-10 pl-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 text-sm font-medium">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="your.email@example.com"
                                type="email"
                                {...field}
                                className="bg-[#1a1d2d] border-gray-700 h-10 pl-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 text-sm font-medium">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="••••••••"
                                type="password"
                                {...field}
                                className="bg-[#1a1d2d] border-gray-700 h-10 pl-10 rounded-md focus:border-[#DEFF58] focus:ring-[#DEFF58] text-white placeholder:text-gray-500 text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                          <p className="text-xs text-gray-400 mt-1">
                            Password must be at least 8 characters and include
                            uppercase, lowercase and numbers
                          </p>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting || registerMutation.isPending}
                      className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02]"
                    >
                      {isSubmitting || registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Fan Account
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="relative flex items-center justify-center mt-6">
                  <div className="absolute border-t border-gray-700 w-full"></div>
                  <span className="relative bg-[#10121f] px-2 text-sm text-gray-400">
                    Or continue with
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleAuth}
                  className="w-full bg-[#1a1d2d] border-gray-700 text-white hover:bg-[#262a3d] hover:text-white rounded-md h-12"
                >
                  {isGoogleAuth ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {isGoogleAuth ? "Authenticating..." : "Continue with Google"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Particles
          className="absolute inset-0 z-0"
          quantity={200}
          ease={80}
          color={"#DEFF58"}
          refresh
        />
      </div>
    );
  };

  return <>{renderContent()}</>;
}
