"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); 

  const handleLogin = async () => {
    setErrorMsg("");
  
    // Fetch the user from the users table by username or email
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single(); // Ensure single user result
  
    if (error || !data || data.password !== password) {
      setErrorMsg("Invalid username or password");
      return;
    }
  
    // Proceed to dashboard after successful login
    router.push("/dashboard");
  };
  

  const handleSignUp = async () => {
    setErrorMsg(""); 
  
    // Check if username already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();
  
    if (existingUser) {
      setErrorMsg("Username already taken");
      return;
    }
  
    // Insert the new user with username, password, email, and role
    const { error } = await supabase
      .from("users")
      .insert([{ username, password, email, role: 'user' }]);
  
    if (error) {
      setErrorMsg("Error signing up. Please try again.");
      return;
    }
  
    // Redirect after successful sign-up
    router.push("/dashboard");
  };
  

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[url('/background-1.svg')] bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            {isSignUp ? "Sign Up for Remind Me" : "Sign In to Remind Me"}
          </h2>
        </div>
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            onClick={isSignUp ? handleSignUp : handleLogin}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <p className="text-sm text-center text-gray-600">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

