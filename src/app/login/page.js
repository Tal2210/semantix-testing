"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* ----------------- handlers ----------------- */
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });
      if (res.error) setError("Invalid username or password");
      else router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign‑in failed.");
      setIsLoading(false);
    }
  };

  /* ----------------- UI ----------------- */
  return (
    <div
      dir="ltr"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-4"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
          <p className="text-blue-100 text-center mt-2">Sign in to continue</p>
        </div>

        <div className="p-8 space-y-6">
          {/* credentials form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            {/* username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="text-right">
              <a className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in with Username"}
            </button>
          </form>

          {/* divider */}
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-4 text-sm text-gray-500">
              or
            </span>
          </div>

          {/* Google button with logo */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-70"
          >
            {/* Google SVG */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.7-1.6-34.7-4.6-51.2H272v96.9h146.9c-6.4 34-25.6 62.8-54.7 82v68.2h88.4c51.7-47.7 81.6-118.1 81.6-195.9z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c73.7 0 135.4-24.3 180.5-66.1l-88.4-68.2c-24.5 16.4-55.6 26.1-92.1 26.1-70.9 0-131-47.9-152.3-112.1h-89v70.6C79.2 483.1 168.8 544.3 272 544.3z"
              />
              <path
                fill="#FBBC04"
                d="M119.7 323.9c-8.3-24.9-8.3-51.6 0-76.5v-70.6h-89c-39.1 77.8-39.1 169.7 0 247.5l89-70.4z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39.9-.6 77.9 14.1 107 40.8l80.1-80.1C381.6 15.4 311.8-4.2 238 0 134.8 0 45.2 61.2 13.7 149.3l89 70.6C141 155.5 201.1 107.7 272 107.7z"
              />
            </svg>
            {isLoading ? "Redirecting..." : "Sign in with Google"}
          </button>

          {/* error */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* sign‑up note */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don’t have an account?{" "}
            <a
              onClick={handleGoogleSignIn}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Sign up with Google
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
