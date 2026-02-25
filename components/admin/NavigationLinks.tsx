"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Menu,
  BookOpen,
  BookMarked,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Database Pages", icon: FileText },
  { href: "/admin/blogs", label: "Blogs", icon: BookMarked },
  { href: "/admin/navigation", label: "Navigation", icon: Menu },
  { href: "/admin/manual", label: "User Manual", icon: BookOpen },
];

export default function NavigationLinks() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("website_id");

  return (
    <ul className="space-y-1.5 mb-6">
      {navItems.map((item) => {
        const href = websiteId 
          ? `${item.href}?website_id=${websiteId}`
          : item.href;
        
        return (
          <li key={item.href}>
            <Link
              href={href}
              className="flex items-center px-3 py-2.5 text-base font-medium text-slate-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150 group"
            >
              <item.icon className="w-5 h-5 mr-3 text-slate-500 group-hover:text-purple-600 transition-colors" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
