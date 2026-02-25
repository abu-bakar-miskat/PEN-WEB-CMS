"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FlipLink from "@/components/shared/Animation/FlipLink";
import Bounded from "../Bounded/Bounded";
import { useNav } from "@/lib/hooks/useNav";
import { Menu, X } from "lucide-react";
import FlipLinkReverse from "../Animation/FlipLinkReverse";

const Navbar = ({ isHome = false }: { isHome?: boolean }) => {
  const { data: navItems = [], isLoading, error } = useNav();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (error) return null;

  return (
    <nav
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${scrolled ? "py-4 " : "py-6"} ${scrolled && isHome ? "bg-primary" : scrolled ? "bg-[#FFFCF8]" : isHome ? "bg-transparent" : "bg-transparent"}`}
    >
      <Bounded>
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src={
                isHome
                  ? "/logo.svg"
                  : scrolled
                    ? "/logo-alt.svg"
                    : "/logo-alt.svg"
              }
              alt="ZETA System of SmartLearning"
              width={167}
              height={57}
              priority
            />
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((link) => (
              <li key={link.id}>
                <FlipLink
                  href={link.url}
                  className={`text-lg transition-colors ${isHome ? "text-white hover:text-primary-30" : "text-black hover:text-gray-600"}`}
                  hoverColor={isHome ? "#ffff" : "#000"}
                >
                  {link.label}
                </FlipLink>
              </li>
            ))}
          </ul>

          {/* Right: CTA Button (Desktop) */}
          <div
            className={`hidden lg:flex items-center justify-center rounded-full text-lg ${isHome ? "text-black bg-white" : "text-primary bg-secondary"} px-6 py-3.5 `}
          >
            <FlipLinkReverse
              href="/contact-us"
              hoverColor={isHome ? "#000" : "#040D3D"}
            >
              Speak with an advisor
            </FlipLinkReverse>
          </div>

          {/* Hamburger (Mobile) */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X
                className={`w-7 h-7 ${isHome ? "text-white" : "text-black"}`}
              />
            ) : (
              <Menu
                className={`w-7 h-7 ${isHome ? "text-white" : "text-black"}`}
              />
            )}
          </button>
        </div>
      </Bounded>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className={`lg:hidden ${isHome ? "bg-primary-700/95" : "bg-white"}`}
        >
          <Bounded>
            <ul className="flex flex-col gap-6 py-8">
              {navItems.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className={`text-lg ${isHome ? "text-white" : "text-black"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact-us">
                  <button
                    className={`rounded-full px-6 py-3.5 text-lg w-full ${isHome ? "text-black bg-white" : "text-primary bg-secondary"}`}
                  >
                    Speak with an advisor
                  </button>
                </Link>
              </li>
            </ul>
          </Bounded>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
