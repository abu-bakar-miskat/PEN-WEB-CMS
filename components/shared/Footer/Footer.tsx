"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Mail, MapPin, Phone, ArrowDownRight, LucideIcon } from "lucide-react";
import FlipLink from "../Animation/FlipLink";
import FlipLinkReverse from "../Animation/FlipLinkReverse";
import Bounded from "../Bounded/Bounded";
import { useFooter } from "@/lib/hooks/useFooter";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const contactIcons: LucideIcon[] = [Mail, MapPin, Phone];

const defaultFooterColumns = [
  {
    title: "Contact",
    items: [
      { id: "email", label: "marketing@zsos.co.uk", url: "mailto:marketing@zsos.co.uk" },
      { id: "address", label: "116 - 120 Meridian Place\nE14 9FE London, United Kingdom", url: "#" },
      { id: "phone", label: "+44 20 4506 0049", url: "tel:+442045060049" },
    ],
  },
  {
    title: "Main Pages",
    items: [
      { id: "about", label: "About Us", url: "/about-us" },
      { id: "courses", label: "Courses", url: "/courses" },
      { id: "contact", label: "Contact Us", url: "/contact-us" },
    ],
  },
  {
    title: "Other Pages",
    items: [
      { id: "privacy", label: "Privacy Policy", url: "/privacy-policy" },
      { id: "terms", label: "Terms of Service", url: "/terms-of-service" },
      { id: "cookies", label: "Cookie Policy", url: "/cookie-policy" },
      { id: "support", label: "Support Page", url: "/support" },
    ],
  },
  {
    title: "Media",
    items: [
      { id: "facebook", label: "Facebook", url: "https://facebook.com" },
      { id: "linkedin", label: "Linkedin", url: "https://linkedin.com" },
      { id: "instagram", label: "Instagram", url: "https://instagram.com" },
      { id: "x", label: "X", url: "https://x.com" },
    ],
  },
];

const Footer = () => {
  const { data: footerColumns } = useFooter();
  const footerRef = useRef<HTMLElement>(null);

  const columns = footerColumns?.length ? footerColumns : defaultFooterColumns;
  const contactItems = columns[0]?.items ?? [];
  const mainPages = columns[1]?.items ?? [];
  const otherPages = columns[2]?.items ?? [];
  const mediaLinks = columns[3]?.items ?? [];

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero & Subscribe fade up
      gsap.fromTo(
        ".footer-hero",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".footer-hero",
            start: "top 90%",
            once: true,
          },
        },
      );

      // Links columns staggered fade up
      gsap.fromTo(
        ".footer-column",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".footer-links-grid",
            start: "top 90%",
            once: true,
          },
        },
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef}>
      {/* Top Section - Dark */}
      <div className="bg-primary text-white py-25 relative z-10">
        <Bounded>
          {/* Hero & Subscribe */}
          <div className="footer-hero flex items-start justify-between py-16">
            <div>
              <h2
                className="text-[52px] font-bold tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(91deg, #F5C58A 1.74%, #FFF 43.71%, #FFF 61.62%, #769FC3 102.48%)",
                }}
              >
                Let&apos;s work with Us
              </h2>
              <p className="mt-3 text-md text-gray-400">
                ZETA System of Smartlearning exists to provide clarity.
              </p>
            </div>

            <div className="w-[523px]">
              <label className="text-lg text-primary-100">Email</label>
              <div className="border-b border-secondary ">
                <input
                  type="email"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
                  placeholder=""
                />
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-secondary rounded-full px-6 py-3.5 text-lg font-medium text-black">
                <FlipLinkReverse href="#" hoverColor="#000">
                  Subscribe
                </FlipLinkReverse>
                <ArrowDownRight className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer-links-grid grid grid-cols-[2fr_1fr_1fr_1fr] gap-8 py-12">
            {/* Contact */}
            <div className="footer-column">
              <h3 className="text-xl text-primary-100 mb-6">
                {columns[0]?.title ?? "Contact"}
              </h3>
              <div className="space-y-5">
                {contactItems.map(
                  (
                    item: { id: string; label: string; url: string },
                    index: number,
                  ) => {
                    const Icon = contactIcons[index] ?? Mail;
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </span>
                        <span className="text-2xl font-bold whitespace-pre-line">
                          {item.label}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Main Pages */}
            <div className="footer-column">
              <h3 className="text-lg text-primary-100 mb-6">
                {columns[1]?.title ?? "Main Pages"}
              </h3>
              <ul className="space-y-3">
                {mainPages.map(
                  (link: { id: string; label: string; url: string }) => (
                    <li key={link.id}>
                      <FlipLink
                        href={link.url}
                        className="text-xl font-semibold text-white hover:text-gray-300 transition-colors"
                      >
                        {link.label}
                      </FlipLink>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Other Pages */}
            <div className="footer-column">
              <h3 className="text-lg text-primary-100 mb-6">
                {columns[2]?.title ?? "Other Pages"}
              </h3>
              <ul className="space-y-3">
                {otherPages.map(
                  (link: { id: string; label: string; url: string }) => (
                    <li key={link.id}>
                      <FlipLink
                        href={link.url}
                        className="text-xl font-semibold text-white hover:text-gray-300 transition-colors"
                      >
                        {link.label}
                      </FlipLink>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Media */}
            <div className="footer-column">
              <h3 className="text-lg text-primary-100 mb-6">
                {columns[3]?.title ?? "Media"}
              </h3>
              <ul className="space-y-3">
                {mediaLinks.map(
                  (link: { id: string; label: string; url: string }) => (
                    <li key={link.id}>
                      <FlipLink
                        href={link.url}
                        className="text-xl font-semibold text-white hover:text-gray-300 transition-colors"
                      >
                        {link.label}
                      </FlipLink>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </Bounded>
      </div>

      {/* Bottom Branding Section - Gold (reveals from behind) */}
      <div className="bg-secondary sticky bottom-0 z-0">
        <Bounded className="py-16 flex items-center gap-6">
          <Image
            src="/logo.svg"
            alt="ZETA System of SmartLearning"
            width={745}
            height={255}
          />
        </Bounded>
      </div>
    </footer>
  );
};

export default Footer;
