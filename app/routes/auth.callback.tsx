// app/routes/auth.callback.tsx
// OAuth callback handler - Supabase redirects here after Google/GitHub auth

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/data/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Exchange the code from URL for a session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Auth callback error:", error);
        navigate("/login?error=auth_failed");
        return;
      }

      if (session) {
        // Success! Redirect to main app
        navigate("/org-chart");
      } else {
        // No session, back to login
        navigate("/login");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
