"use client";

import Link from "next/link";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Zap, Sparkles, Rocket, Target } from "lucide-react";

export default function Home() {
  const flipWords = ["adapts", "evolves", "grows", "scales", "flexes"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation moved to GlobalHeader in root layout */}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-8">
            <Rocket className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Project management for software teams
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
            <span className="block text-slate-900 dark:text-slate-100">
              Project management that
            </span>
            <div className="flex items-center justify-center gap-3 mt-3">
              <FlipWords
                words={flipWords}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
              />
            </div>
            <span className="block mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              with your team
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Start simple like Trello. Grow powerful like Jira. Without the complexity of either.
            <span className="block mt-2 font-medium text-slate-700 dark:text-slate-300">
              Built for software teams who need more power without the learning curve.
            </span>
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 text-base px-8 py-6"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-base px-8 py-6"
              >
                <Target className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-slate-900 dark:text-slate-100">
            Everything your team needs
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              to ship better software
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            From Kanban boards to Gantt charts, all connected in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Visual Workflow</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Drag-and-drop Kanban boards across organization, project, and personal spaces
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Organize Your Way</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Organization → Projects → Personal Space. Every level customizable with roles and permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Link Across Everything</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Connect tasks, notes, events, and messages. Markdown-powered with [[wiki-style]] linking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 group">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900 dark:text-slate-100">Plan & Track</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Timeline views, dependencies, and integrated calendar with smart notifications
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 text-white shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10" />
          <CardContent className="relative py-16 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-6 text-yellow-300 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              Ready to simplify your project management?
            </h2>
            <p className="text-lg sm:text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Join software teams who moved from Jira's complexity and Trello's limitations.
              <span className="block mt-2 font-medium text-white">
                Start free. Scale when you're ready.
              </span>
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8 py-6 text-base font-semibold"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Create Your Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 mt-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                PoliOrganizaT
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              &copy; 2025 PoliOrganizaT. Project management for software teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}