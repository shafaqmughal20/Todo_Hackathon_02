'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-700/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-primary-700/30 backdrop-blur-sm bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">TaskFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className="px-4 py-2 text-dark-100 hover:text-accent-500 transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-glow"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Organize Your Life</span>
            <br />
            <span className="text-dark-100">With Futuristic Precision</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-xl text-dark-300 mb-12 max-w-2xl mx-auto">
            Experience the next generation of task management. Sleek design, powerful features, and seamless workflow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/signup"
              className="btn-glow text-lg px-8 py-4"
            >
              Start Free Today
            </Link>
            <Link
              href="/signin"
              className="px-8 py-4 rounded-lg border-2 border-primary-700 text-dark-100 font-semibold hover:bg-primary-900/30 hover:border-accent-500 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {/* Feature 1 */}
            <div className={`card-glow p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-purple flex items-center justify-center">
                <svg className="w-8 h-8 text-white pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-100 mb-2">Secure Authentication</h3>
              <p className="text-dark-300">
                Your data is protected with industry-standard JWT authentication and encryption.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`card-glow p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-purple flex items-center justify-center">
                <svg className="w-8 h-8 text-white pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-100 mb-2">Smart Task Management</h3>
              <p className="text-dark-300">
                Create, organize, and track your tasks with an intuitive and powerful interface.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`card-glow p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-purple flex items-center justify-center">
                <svg className="w-8 h-8 text-white pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-100 mb-2">Lightning Fast</h3>
              <p className="text-dark-300">
                Built with modern technology for instant response and seamless performance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary-700/30 backdrop-blur-sm bg-dark-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-dark-400">
            © 2026 TaskFlow. Built with Next.js and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
