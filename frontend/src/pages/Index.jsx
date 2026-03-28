import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tap-gray">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">TAP</h1>
        <p className="text-xl text-gray-600">Task and Progress Tracker</p>
        <div className="mt-4">
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
