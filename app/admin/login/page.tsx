"use client";

import AuthForm from "@/components/admin/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-[120px] sm:h-[120px] flex items-center justify-center">
              <span className="text-2xl sm:text-4xl font-bold text-purple-600">A</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm px-4">
            Access your admin account
          </p>
        </div>

        {/* Login Card */}
        <div className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-lg p-6">
          <div className="space-y-1 pb-3 sm:pb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-center text-purple-600">
              Team Member Login
            </h2>
          </div>
          <div className="space-y-4">
            <AuthForm />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure Access Portal
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-purple-100 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-indigo-100 opacity-20 blur-3xl"></div>
      </div>
    </main>
  );
}
