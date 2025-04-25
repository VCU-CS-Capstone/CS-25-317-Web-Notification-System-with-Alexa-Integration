"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordContent() {
  // Add keyboard event listener for Enter key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && tokenValid && !successMsg) {
        handleResetPassword(e);
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [tokenValid, successMsg]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, reset_expires")
        .eq("reset_token", tokenToValidate)
        .single();

      if (error || !data) {
        setErrorMsg("Invalid or expired reset token");
        return;
      }

      const resetExpires = new Date(data.reset_expires);
      const now = new Date();

      if (resetExpires < now) {
        setErrorMsg("Reset token has expired. Please request a new password reset.");
        return;
      }

      setTokenValid(true);
      setUserId(data.id);
    } catch (error) {
      console.error("Error validating token:", error);
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all fields");
      setIsResetting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsResetting(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      setIsResetting(false);
      return;
    }

    try {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      const { error } = await supabase
        .from("users")
        .update({
          password: hashedPassword,
          reset_token: null,
          reset_expires: null
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setSuccessMsg("Password has been reset successfully. You can now log in with your new password.");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)]">Reset Password</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Enter your new password below
          </p>
        </motion.div>

        {!tokenValid ? (
          <motion.div 
            className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {errorMsg ? (
              <motion.div 
                className="text-red-500 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errorMsg}
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent-color)] mx-auto mb-4"></div>
                <p>Validating reset token...</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {successMsg ? (
              <div className="text-green-500 mb-4 text-center">{successMsg}</div>
            ) : (
              <motion.form 
                className="space-y-6" 
                onSubmit={handleResetPassword}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--text-primary)]">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)]">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <motion.button
                    type="submit"
                    disabled={isResetting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-on-accent)] bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:opacity-50"
                  >
                    {isResetting ? "Resetting..." : "Reset Password"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </motion.div>
        )}

        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            className="text-sm text-[var(--accent-color)] hover:underline"
          >
            Back to Login
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-primary)] text-xl">Loading reset password page...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
