"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";

export default function HeaderAuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Close popover when clicking outside.
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate popover position relative to the button.
  useEffect(() => {
    if (showPopover && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popoverWidth = Math.min(280, viewportWidth * 0.9);
      let leftPosition = rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2;
      if (leftPosition < 10) leftPosition = 10;
      if (leftPosition + popoverWidth > viewportWidth - 10) {
        leftPosition = viewportWidth - popoverWidth - 10;
      }
      setPopoverPosition({
        top: rect.bottom + window.scrollY + 8,
        left: leftPosition,
      });
    }
  }, [showPopover]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });
      if (result.error) {
        setError("Invalid username or password");
      } else {
        setShowPopover(false);
        setUsername("");
        setPassword("");
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <>
      <div dir="ltr" className="relative z-[9999]">
        {session ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-md transition-all duration-300 text-sm font-medium"
          >
            <span>Dashboard</span>
          </button>
        ) : (
          <button
            ref={buttonRef}
            onClick={() => setShowPopover(!showPopover)}
            className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            aria-label="Sign In"
          >
            <UserCircle size={26} className="text-gray-700" />
          </button>
        )}
      </div>

      {showPopover &&
        createPortal(
          <div
            ref={popoverRef}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-100 animate-fadeIn"
            style={{
              position: "absolute",
              top: popoverPosition.top,
              left: popoverPosition.left,
              width: "min(280px, 90vw)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              zIndex: 9999,
              direction: "ltr",
            }}
          >
            {/* Centered arrow */}
          

            <div  className="mb-2 text-center">
              <h2 className="text-base font-medium text-gray-800">Sign In</h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Username"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-1">{error}</p>
              )}
              <div className="flex items-center justify-between pt-1">
                <a href="#" className="text-xs text-blue-600">
                  Forgot password?
                </a>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>

           
          </div>,
          document.body
        )}
    </>
  );
}
