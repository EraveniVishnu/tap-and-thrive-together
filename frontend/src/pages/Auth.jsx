
import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tap-gray p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TAP</h1>
          <p className="text-gray-600">Task and Progress Tracker</p>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
