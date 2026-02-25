"use client";
import Link from "next/link";
// import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function CookiePolicyPage() {
  return (
    <div className="px-4 py-16 mx-auto max-w-4xl md:px-8 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 mb-5">
          {/* <BookOpenIcon className="h-12 w-12 text-purple-600" /> */}
        </div>
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>
      </div>

      <div className="mb-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Cookie Policy Summary</h2>
        <p className="mb-4">
          At ZETA SYSTEM OF SMART LEARNING, we use cookies and similar
          technologies in accordance with the UK GDPR and PECR to ensure you
          have the best experience on our website, while maintaining your
          privacy rights.
        </p>
      </div>

      <div className="space-y-10">
        {/* Essential Cookies Section */}
        <div className="group">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
            <p className="mb-4 text-gray-700">
              Critical for the website to function effectively. They enable
              basic functionality such as page navigation, secure areas access,
              and protection against fraudulent traffic. These cookies cannot be
              disabled.
            </p>
            <div className="pl-4 border-l-2 border-purple-600">
              <p className="font-medium">Cloudflare:</p>
              <p className="text-sm text-gray-600 mb-1">
                Used to enhance website security and performance, identify
                trusted web traffic and protect against malicious users.
              </p>
              <Link
                href="https://www.cloudflare.com/cookie-policy/"
                className="text-sm text-purple-600 hover:underline"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>

        {/* Functional Cookies Section */}
        <div className="group">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
            <p className="mb-4 text-gray-700">
              Allow the website to remember choices you make and provide
              enhanced functionality and personalization. They may be used to
              provide services you have requested.
            </p>
            <div className="space-y-4">
              <div className="pl-4 border-l-2 border-purple-600">
                <p className="font-medium">Vimeo:</p>
                <p className="text-sm text-gray-600 mb-1">
                  Used to deliver video content, store user preferences, and
                  collect usage statistics.
                </p>
                <Link
                  href="https://vimeo.com/cookie_policy"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Learn more
                </Link>
              </div>
              <div className="pl-4 border-l-2 border-purple-600">
                <p className="font-medium">YouTube:</p>
                <p className="text-sm text-gray-600 mb-1">
                  Helps enable video playback, collect user interaction data,
                  and deliver personalised content.
                </p>
                <Link
                  href="https://policies.google.com/privacy"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cookies Section */}
        <div className="group">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="mb-4 text-gray-700">
              Collect information about how visitors use our website. The data
              collected is aggregated and anonymised to help us improve
              usability and performance.
            </p>
            <div className="space-y-4">
              <div className="pl-4 border-l-2 border-purple-600">
                <p className="font-medium">Google Analytics:</p>
                <p className="text-sm text-gray-600 mb-1">
                  Provides insights into user behaviour, traffic sources, and
                  content performance.
                </p>
                <Link
                  href="https://policies.google.com/privacy"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Learn more
                </Link>
              </div>
              <div className="pl-4 border-l-2 border-purple-600">
                <p className="font-medium">Vercel Analytics:</p>
                <p className="text-sm text-gray-600 mb-1">
                  Measures website performance and infrastructure metrics.
                </p>
                <Link
                  href="https://vercel.com/legal/privacy-policy"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Cookies Section */}
        <div className="group">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Marketing</h3>
            <p className="mb-4 text-gray-700">
              Used to deliver advertisements more relevant to you and your
              interests. They help measure the effectiveness of advertising
              campaigns.
            </p>
            <div className="pl-4 border-l-2 border-purple-600">
              <p className="font-medium">Facebook Pixel:</p>
              <p className="text-sm text-gray-600 mb-1">
                Tracks conversions, optimises ads, and builds targeted audiences
                for future campaigns.
              </p>
              <Link
                href="https://www.facebook.com/policy/cookies/"
                className="text-sm text-purple-600 hover:underline"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Management Section */}
      <div className="mt-16 text-center">
        <div className="relative inline-block">
          <div className="relative p-8 bg-white border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Manage Your Cookie Preferences
            </h2>
            <p className="mb-6 text-gray-700">
              You can review and change your cookie preferences at any time:
            </p>
            <button
              onClick={() => {
                // This would need client-side handling to open the modal
                // For now, we can use a workaround to show the banner again
                localStorage.removeItem("cookieConsent");
                window.location.reload();
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:opacity-90 transition-colors"
            >
              Manage Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
