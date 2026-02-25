import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <AlertCircle className="w-20 h-20 text-slate-400 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Website Not Found</h1>
        <p className="text-lg text-slate-600 mb-8">
          The website you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white text-base font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Select a Website
          </Link>
        </div>
      </div>
    </div>
  );
}
