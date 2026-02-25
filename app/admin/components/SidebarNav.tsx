'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Menu,
  BookOpen,
  BookMarked,
  Home,
} from "lucide-react";
import { getInstitutionNameByWebsiteId } from "@/app/admin/actions/websites";

interface SidebarNavProps {
  institutionName: string;
  userEmail: string;
}

export default function SidebarNav({ institutionName: defaultInstitutionName, userEmail }: SidebarNavProps) {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get('website_id');
  const [institutionName, setInstitutionName] = useState<string>(defaultInstitutionName);
  
  useEffect(() => {
    const fetchInstitutionName = async () => {
      if (websiteId) {
        const { institutionName: name, error } = await getInstitutionNameByWebsiteId(websiteId);
        if (!error && name) {
          setInstitutionName(name);
        }
      }
    };
    
    fetchInstitutionName();
  }, [websiteId]);

  // Helper to build URLs with website_id parameter
  const buildUrl = (path: string) => {
    if (websiteId) {
      return `${path}${path.includes('?') ? '&' : '?'}website_id=${websiteId}`;
    }
    return path;
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/pages", label: "Database Pages", icon: FileText },
    { href: "/admin/blogs", label: "Blogs", icon: BookMarked },
    { href: "/admin/navigation", label: "Navigation", icon: Menu },
    { href: "/admin/manual", label: "User Manual", icon: BookOpen },
  ];

  return (
    <>
      <div className="flex items-center mb-8 px-2">
        <h2 className="text-2xl font-bold text-purple-600 tracking-tight">
          {institutionName}
        </h2>
      </div>

      <ul className="space-y-1.5 mb-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href === "/" ? "/" : buildUrl(item.href)}
              className="flex items-center px-3 py-2.5 text-base font-medium text-slate-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150 group"
            >
              <item.icon className="w-5 h-5 mr-3 text-slate-500 group-hover:text-purple-600 transition-colors" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 pt-4 mt-auto">
        {userEmail && (
          <div className="mb-3 px-3 py-2">
            <p className="text-xs text-slate-500 mb-1">Logged in as</p>
            <p className="text-sm font-medium text-slate-700 truncate" title={userEmail}>
              {userEmail}
            </p>
          </div>
        )}
        <form action="/admin/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center justify-center px-3 py-2.5 text-base font-medium text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 mr-3 text-slate-500 group-hover:text-red-600 transition-colors"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </>
  );
}
