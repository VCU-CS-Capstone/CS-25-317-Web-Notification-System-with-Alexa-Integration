"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import bcrypt from "bcryptjs";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import components to improve initial load time
const FeaturesSection = dynamic(() => import("./components/FeaturesSection"));
const TestimonialsSection = dynamic(() => import("./components/TestimonialsSection"));
const MobileShortcutGuide = dynamic(() => import("./components/MobileShortcutGuide"));

export default function HomePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [colorMode, setColorMode] = useState(""); // Default is high contrast mode

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    // Make username search case-insensitive
    // Using a more compatible approach for case-insensitive matching
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");
      
    if (usersError) {
      setErrorMsg("Error connecting to database. Please try again.");
      return;
    }
    
    // Manually filter for case-insensitive username match
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      setErrorMsg("Invalid username or password");
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      setErrorMsg("Invalid username or password");
      return;
    }

    localStorage.setItem("username", username);
    router.push("/dashboard");
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate inputs
    if (!username || !password || !email) {
      setErrorMsg("Please fill in all required fields");
      return;
    }

    // Check if username already exists (case-insensitive)
    const { data: allUsers, error: searchError } = await supabase
      .from("users")
      .select("*");
      
    if (searchError) {
      setErrorMsg("Error connecting to database. Please try again.");
      return;
    }
    
    // Manually check for case-insensitive match
    const existingUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (existingUser) {
      setErrorMsg("Username already taken");
      return;
    }

    // Hash password and create user
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([{ username, password: hashedPassword, email, role: "user" }]);

    if (error) {
      console.error("Signup error:", error);
      setErrorMsg("Error signing up. Please try again.");
      return;
    }

    // Clear form fields
    setUsername("");
    setPassword("");
    setEmail("");
    
    // Set success message and switch to login view
    setSuccessMsg("Account created successfully! Please log in.");
    setIsSignUp(false);
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!resetEmail) {
      setErrorMsg("Please enter your email address");
      setIsResetting(false);
      return;
    }
    
    try {
      // Check if the email exists in the database
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", resetEmail)
        .single();
      
      if (error || !data) {
        setErrorMsg("No account found with this email address");
        setIsResetting(false);
        return;
      }
      
      // Generate a random reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour
      
      // Store the reset token in the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          reset_token: resetToken,
          reset_expires: resetExpires.toISOString()
        })
        .eq("email", resetEmail);
      
      if (updateError) {
        throw updateError;
      }
      
      // In a real application, you would send an email with a link containing the reset token
      // For this demo, we'll just show the reset link directly to the user
      console.log(`Reset token for ${resetEmail}: ${resetToken}`);
      
      // Get the current domain for the reset link
      const domain = window.location.origin;
      const resetLink = `${domain}/reset-password?token=${resetToken}`;
      console.log(`Reset link: ${resetLink}`);
      
      // Show the reset link to the user instead of just a success message
      setSuccessMsg(
        `Since email sending is not configured, please use this link to reset your password (valid for 1 hour):\n\n` +
        resetLink
      );
      
      // In a real application, you would use an email service like SendGrid, AWS SES, etc.
      // Example code for sending email (not functional in this demo):
      /*
      const emailContent = `
        <h1>Password Reset</h1>
        <p>You requested a password reset for your RemindMe account.</p>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="https://your-app.com/reset-password?token=${resetToken}">Reset Password</a>
      `;
      
      await sendEmail({
        to: resetEmail,
        subject: "Password Reset Request",
        html: emailContent
      });
      */
      
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  // Add keyboard event listener for Enter key on forms
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (isForgotPassword) {
          handleResetPassword(e);
        } else if (isSignUp) {
          handleSignUp(e);
        } else {
          handleLogin(e);
        }
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isForgotPassword, isSignUp]);
  
  // Load color mode preference from localStorage when component mounts
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedColorMode = localStorage.getItem('colorMode');
      if (storedColorMode) {
        setColorMode(storedColorMode);
        
        // Apply the color mode class to the HTML element
        document.documentElement.classList.remove('light', 'dark');
        if (storedColorMode) {
          document.documentElement.classList.add(storedColorMode);
        }
      }
    }
  }, []);
  
  // Get background based on color mode
  const getBackgroundStyle = () => {
    switch (colorMode) {
      case 'light':
        return {
          background: 'linear-gradient(135deg, #f5f5f0 0%, #e8e8e0 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: 'calc(-1 * env(safe-area-inset-top))',
          paddingTop: 'calc(env(safe-area-inset-top) + 3rem)'
        };
      case 'dark':
        return {
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: 'calc(-1 * env(safe-area-inset-top))',
          paddingTop: 'calc(env(safe-area-inset-top) + 3rem)'
        };
      default: // High contrast mode
        return {
          backgroundImage: 'url("/background-1.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          marginTop: 'calc(-1 * env(safe-area-inset-top))',
          paddingTop: 'calc(env(safe-area-inset-top) + 3rem)'
        };
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={getBackgroundStyle()}>
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-4xl font-extrabold text-[var(--text-primary)] mb-2">
            Remind Me
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Your smart reminder system with Alexa integration and cross-device synchronization
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column: Login form */}
          <div className="md:w-1/2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-center text-2xl font-bold text-[var(--text-primary)]">
                {isForgotPassword 
                  ? "Reset Your Password" 
                  : isSignUp 
                    ? "Sign Up for Remind Me" 
                    : "Sign In to Remind Me"}
              </h2>
            </motion.div>
            <motion.div 
              className="bg-[var(--bg-primary)] py-8 px-6 shadow-lg rounded-lg space-y-6 border border-[var(--accent-color)] backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
          {isForgotPassword ? (
            <motion.form onSubmit={handleResetPassword} className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Email Address
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={isResetting}
                whileHover={{ backgroundColor: "var(--accent-color-hover)" }}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-[var(--text-on-accent)] bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
              >
                {isResetting ? "Sending..." : "Send Reset Instructions"}
              </motion.button>
              
              {errorMsg && (
                <p className="text-red-500 text-sm text-center">{errorMsg}</p>
              )}
              
              {successMsg && (
                <p className="text-green-500 text-sm text-center">{successMsg}</p>
              )}
              
              <p className="text-sm text-center text-[var(--text-secondary)]">
                <motion.button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  whileHover={{ textDecoration: "underline" }}
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Back to Sign In
                </motion.button>
              </p>
            </motion.form>
          ) : (
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    required={isSignUp}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg("");
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  />
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                />
              </div>
            
              <motion.button
                type="submit"
                whileHover={{ backgroundColor: "var(--accent-color-hover)" }}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-[var(--text-on-accent)] bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </motion.button>

              {errorMsg && (
                <p className="text-red-500 text-sm text-center">{errorMsg}</p>
              )}

              <div className="flex flex-col space-y-2">
                <p className="text-sm text-center text-[var(--text-secondary)]">
                  {isSignUp ? "Already have an account?" : "New here?"}{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg("");
                    }}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
                
                {!isSignUp && (
                  <p className="text-sm text-center text-[var(--text-secondary)]">
                    <motion.button
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMsg("");
                      }}
                      whileHover={{ textDecoration: "underline" }}
                      className="text-blue-600 hover:underline focus:outline-none"
                    >
                      Forgot your password?
                    </motion.button>
                  </p>
                )}
              </div>
            </form>
          )}
            </motion.div>
            
            {/* Mobile Shortcut Guide */}
            <div className="mt-4">
              <MobileShortcutGuide />
            </div>
          </div>
          
          {/* Right column: Features and Testimonials */}
          <div className="md:w-1/2 space-y-6">
            <FeaturesSection />
            <TestimonialsSection />
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-[var(--text-secondary)] mt-8">
          <p>© {new Date().getFullYear()} Remind Me. All rights reserved.</p>
          <p className="mt-1">A VCU CS Capstone Project</p>
        </div>
      </div>
    </main>
  );
}
