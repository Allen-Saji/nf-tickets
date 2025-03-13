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

// Define the form validation schema for fan login
const FanLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Define the form validation schema for artist login
const ArtistLoginSchema = z.object({
  email: z.string().min(1, "email is required"),
  password: z.string().min(1, "Password is required"),
});

type FanLoginFormData = z.infer<typeof FanLoginSchema>;
type ArtistLoginFormData = z.infer<typeof ArtistLoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"initial" | "fan" | "artist">(
    "initial"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  // Initialize the fan login form with react-hook-form
  const fanForm = useForm<FanLoginFormData>({
    resolver: zodResolver(FanLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize the artist login form with react-hook-form
  const artistForm = useForm<ArtistLoginFormData>({
    resolver: zodResolver(ArtistLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleFanLogin = async (data: FanLoginFormData) => {
    try {
      setIsSubmitting(true);
      const result = await signIn(
        "credentials",
        {
          redirect: false,
          email: data.email,
          password: data.password,
        },
        { callbackUrl: "/" }
      );

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Login Successful", {
        description: "Welcome back!",
        duration: 3000,
        className: "bg-[#1a1d2d] border-green-500 text-white",
      });
      router.push("/");
    } catch (error) {
      toast.error("Authentication Failed", {
        description: "Invalid email or password",
        duration: 5000,
        className: "bg-[#1a1d2d] border-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleArtistLogin = async (data: ArtistLoginFormData) => {
    try {
      setIsSubmitting(true);

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login Failed", {
          description: "Invalid email or password",
          duration: 5000,
          className: "bg-[#1a1d2d] border-red-500 text-white",
        });
      } else {
        toast.success("Artist Login Successful", {
          description: "Welcome back to your artist account!",
          duration: 3000,
          className: "bg-[#1a1d2d] border-green-500 text-white",
        });
        router.push("/events");
      }
    } catch (error) {
      toast.error("Authentication Failed", {
        description: "An error occurred during login",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Authentication (for fan login only)
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

  // Render different content based on login type
  const renderContent = () => {
    return (
      <div className="flex items-center justify-center bg-black text-white min-h-screen overflow-hidden">
        <Card className="w-full max-w-xl bg-[#10121f] border border-gray-800 rounded-lg shadow-xl z-10">
          <CardContent className="pt-6 pb-8">
            {loginType === "initial" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold mb-6">
                  Welcome <span className="text-[#DEFF58]">Back</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  Choose how you want to log in to our platform
                </p>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <Button
                    onClick={() => setLoginType("fan")}
                    className="bg-[#1a1d2d] text-white border border-gray-700 hover:bg-[#262a3d] hover:text-[#DEFF58] h-12 font-medium"
                  >
                    Log in as a Fan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    onClick={() => setLoginType("artist")}
                    className="bg-[#DEFF58] text-black hover:bg-[#f0ff85] hover:scale-[1.02] transition-all duration-300 h-12 font-medium"
                  >
                    Log in as an Artist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <p className="text-center text-gray-500 text-sm pt-4">
                  Don't have an account yet?{" "}
                  <a href="/signup" className="text-[#DEFF58] hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            )}

            {loginType === "fan" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">
                    <span className="text-[#DEFF58]">Fan</span> Login
                  </h1>
                  <Button
                    variant="ghost"
                    onClick={() => setLoginType("initial")}
                    className="text-gray-400 hover:text-white"
                  >
                    Back
                  </Button>
                </div>

                <Form {...fanForm}>
                  <form
                    onSubmit={fanForm.handleSubmit(handleFanLogin)}
                    className="space-y-5"
                  >
                    <FormField
                      control={fanForm.control}
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
                      control={fanForm.control}
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
                          <div className="flex justify-end">
                            <a
                              href="/forgot-password"
                              className="text-xs text-[#DEFF58] hover:underline mt-1"
                            >
                              Forgot password?
                            </a>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Log In
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

            {loginType === "artist" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">
                    <span className="text-[#DEFF58]">Artist</span> Login
                  </h1>
                  <Button
                    variant="ghost"
                    onClick={() => setLoginType("initial")}
                    className="text-gray-400 hover:text-white"
                  >
                    Back
                  </Button>
                </div>

                <Form {...artistForm}>
                  <form
                    onSubmit={artistForm.handleSubmit(handleArtistLogin)}
                    className="space-y-5"
                  >
                    <FormField
                      control={artistForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 text-sm font-medium">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input
                                placeholder="Enter your username"
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
                      control={artistForm.control}
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
                          <div className="flex justify-end">
                            <a
                              href="/forgot-password"
                              className="text-xs text-[#DEFF58] hover:underline mt-1"
                            >
                              Forgot password?
                            </a>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-[#DEFF58] text-black font-semibold rounded-full h-12 transition-all duration-300 hover:bg-[#f0ff85] hover:scale-[1.02]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Log In to Artist Account
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
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
