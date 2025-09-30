"use client";

import Link from "next/link";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Zap } from "lucide-react";

export default function Home() {
  const words = [
    {
      text: "Build",
    },
    {
      text: "your",
    },
    {
      text: "next",
    },
    {
      text: "SaaS",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "application",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">Poli2</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span>Build your next </span>
            <span className="text-blue-500">SaaS application</span>
          </h1>
          <TypewriterEffectSmooth words={words} className="justify-center" />
          <p className="mt-8 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            A multi-tenant SaaS platform built with Clean Architecture, Next.js, and Supabase.
            Manage organizations, collaborate with teams, and scale with confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to build modern SaaS
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Built with best practices and modern technologies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Multi-Tenant</CardTitle>
              <CardDescription>
                Isolated organizations with role-based access control and RLS security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Invite members, assign roles, and manage permissions seamlessly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Secure by Default</CardTitle>
              <CardDescription>
                Row Level Security, authentication, and authorization built-in
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-500 mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with Next.js 14, TanStack Query, and optimized performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 text-blue-100">
              Join thousands of teams building better products with Poli2
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary">
                Create Your Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-neutral-600 dark:text-neutral-400">
            <p>&copy; 2025 Poli2. Built with Clean Architecture & TDD.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}