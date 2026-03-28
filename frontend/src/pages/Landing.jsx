
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Award, BarChart2, Bell } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-tap-gray dark:from-tap-dark-purple dark:to-tap-dark-charcoal">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-blue-600">TAP</h1>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Task & Progress Tracker</span>
          </div>
          <div>
            <Button asChild className="btn-tap-primary">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Track Tasks, Build Habits, <span className="text-blue-600">Thrive Together</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              TAP helps you stay disciplined and productive by tracking your tasks, 
              suggesting wellness goals, and gamifying your productivity journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="btn-tap-primary">
                <Link to="/auth">Sign Up Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Login</Link>
              </Button>
            </div>
          </div>
          <div className="bg-white dark:bg-tap-dark-charcoal rounded-xl shadow-lg p-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Track Daily Tasks</h3>
                  <p className="text-sm text-gray-500">Organize your day with custom tasks and priorities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Smart Reminders</h3>
                  <p className="text-sm text-gray-500">Never miss important tasks with timely notifications</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium">Earn Points & Badges</h3>
                  <p className="text-sm text-gray-500">Stay motivated with achievement rewards</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <BarChart2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Visualize Progress</h3>
                  <p className="text-sm text-gray-500">Track your productivity with beautiful charts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-tap-blue dark:bg-tap-dark-purple/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TAP?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-tap-dark-charcoal rounded-xl p-6 shadow-sm hover-scale">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Task Management</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Organize daily tasks and occasional commitments with smart priorities and reminders.
              </p>
            </div>
            <div className="bg-white dark:bg-tap-dark-charcoal rounded-xl p-6 shadow-sm hover-scale">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Gamified Experience</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Earn points, badges, and maintain streaks to stay motivated and build lasting habits.
              </p>
            </div>
            <div className="bg-white dark:bg-tap-dark-charcoal rounded-xl p-6 shadow-sm hover-scale">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Progress Tracking</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your productivity with charts and compare your performance over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to boost your productivity?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are improving their daily habits and achieving more with TAP.
        </p>
        <Button asChild size="lg" className="btn-tap-primary">
          <Link to="/auth">Get Started for Free</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-tap-dark-purple py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-blue-600">TAP</h2>
              <p className="text-gray-600 dark:text-gray-300">Task & Progress Tracker</p>
            </div>
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} TAP. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
