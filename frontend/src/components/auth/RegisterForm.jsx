
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const RegisterForm = ({ onSwitchForm }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState(undefined);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, sendOTP } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSendingOtp(true);
      await sendOTP(email);
      setIsOtpSent(true);
      toast({
        title: "Code sent!",
        description: "Please check your email terminal preview for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: error.response?.data?.error || error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword || !otp) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields including the verification code.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(username, email, password, otp);
      toast({
        title: "Registration successful",
        description: "Welcome to TAP! Your account has been created.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      
      // Check for specific error messages from Supabase
      if (error.message && error.message.includes("User already registered")) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please log in instead.",
          variant: "destructive",
        });
      } else if (error.message && error.message.includes("duplicate key")) {
        toast({
          title: "Username already taken",
          description: "This username is already taken. Please choose a different one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.response?.data?.error || error.message || "There was an error creating your account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Join TAP to start tracking your tasks and building healthy habits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isOtpSent}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSendOTP}
                disabled={isSendingOtp || isOtpSent || !email}
              >
                {isSendingOtp ? "Sending..." : isOtpSent ? "Sent!" : "Send Code"}
              </Button>
            </div>
          </div>
          
          {isOtpSent && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="age">Age (Optional)</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              min={13}
              max={120}
              value={age || ""}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full btn-tap-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm w-full">
          <span>Already have an account? </span>
          <button
            onClick={onSwitchForm}
            className="text-blue-600 hover:underline"
            type="button"
          >
            Login
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
