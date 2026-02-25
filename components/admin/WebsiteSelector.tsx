"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Website {
  id: string;
  title?: string;
  name?: string;
}

interface WebsiteSelectorProps {
  websites: Website[];
  currentWebsiteId?: string;
}

export default function WebsiteSelector({ websites, currentWebsiteId }: WebsiteSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWebsiteIdFromUrl = searchParams.get("website_id") || currentWebsiteId || websites[0]?.id;

  const handleWebsiteChange = (websiteId: string) => {
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?website_id=${websiteId}`);
  };

  if (websites.length <= 1) {
    return null; // Don't show selector if only one or no websites
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Select Website
      </label>
      <select
        value={currentWebsiteIdFromUrl || ""}
        onChange={(e) => handleWebsiteChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {websites.map((website) => (
          <option key={website.id} value={website.id}>
            {website.title || website.name || `Website ${website.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
