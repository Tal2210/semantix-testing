"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserCircle, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import Link from "next/link";

export default function HeaderAuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Close popover when clicking outside
  useEffect(() => {
    function onClick(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Position popover under the icon
  useEffect(() => {
    if (!show || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const w = Math.min(260, window.innerWidth * 0.9);
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - w - 10));
    setPos({ top: rect.bottom + window.scrollY + 8, left });
  }, [show]);

  // Close popover after successfully signing in
  useEffect(() => {
    if (status === "authenticated") {
      setShow(false);
    }
  }, [status]);

  /* ──────────────────────────────────────────────────────────── */
  /*  helpers                                                   */
  const googleSignIn = () =>
    signIn("google", {
      callbackUrl: "/subscription",
      authorizationParams: { prompt: "select_account" }
    });

  const handleLogout = async () => {
    try {
      // First clear any local state/storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Sign out and force a full page reload to clear all state
      await signOut({ 
        redirect: false
      });
      
      // Manual redirect after cleanup
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force reload if something goes wrong
      window.location.reload();
    }
  };

  return (
    <>
      {/* Always LTR so the element stays left-to-right aligned */}
      <div dir="ltr" className="relative z-[9999]">
        {session ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium transform hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <LayoutDashboard size={18} className="stroke-[2.5]" />
              <span>Dashboard</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 text-sm font-medium"
              aria-label="Sign out"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            ref={buttonRef}
            onClick={() => setShow((s) => !s)}
            className="flex items-center gap-2 py-2 px-4 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
            aria-label="Sign in"
          >
            <LogIn size={18} className="stroke-[2]" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Popover (for unauthenticated users) - This will also be hidden as the button that triggers it is now null */}
      {show && status !== "authenticated" && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: "min(260px,90vw)",
            zIndex: 9999
          }}
          className="bg-white rounded-lg shadow-xl p-5 border border-gray-100 animate-fadeIn"
        >
          <h2 className="text-center text-base font-medium text-gray-800 mb-4">
            Welcome to Semantix
          </h2>
          <button
            onClick={googleSignIn}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt=""
              className="w-5 h-5"
            />
            <span className="font-medium text-sm">
              Continue with Google
            </span>
          </button>
          <p className="mt-4 text-xs text-gray-500 text-center">
            We'll create your account automatically on first sign-in.
          </p>
        </div>,
        document.body
      )}
    </>
  );
}