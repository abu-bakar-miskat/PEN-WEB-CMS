"use client";

import { acceptAllCookies, cookiePreferencesExist } from "@/lib/cookieConsent";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CookiePreferencesDialog from "./CookiePreferenceDialog";

export default function CookieBanner() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if cookie preferences already exist
    const hasPreferences = cookiePreferencesExist();
    setShowBanner(!hasPreferences);
  }, [pathname]);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Only hide the banner temporarily but don't save preferences
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <CookiePreferencesDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          // When dialog closes, recheck preferences to hide banner if saved
          if (!open) {
            const hasPreferences = cookiePreferencesExist();
            setShowBanner(!hasPreferences);
          }
        }}
      />
      <section className="fixed bottom-0 left-0 right-0 z-50 px-4 py-10 lg:p-20 bg-primary rounded-t-[32px] animate-in slide-in-from-bottom duration-1000 font-inter">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
          {/* Content */}
          <div className="flex gap-4 justify-between max-w-194">
            <svg
              width="62"
              height="62"
              viewBox="0 0 62 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="62"
                height="62"
                rx="31"
                fill="#F2B66D"
                fillOpacity="0.2"
              />
              <g clipPath="url(#clip0_322_38696)">
                <path
                  d="M40.8248 19.069C41.9369 19.069 42.8385 19.9706 42.8385 21.0827V39.6945C42.8385 40.5858 42.4789 41.3988 41.89 41.9824C41.3063 42.5662 40.4985 42.931 39.6021 42.931H22.3984C23.2896 42.931 24.1027 42.5662 24.6863 41.9824C25.2701 41.3988 25.6348 40.5858 25.6348 39.6945V21.0827C25.6348 19.9706 26.5364 19.069 27.6485 19.069H40.8248Z"
                  fill="#F2B66D"
                />
                <path
                  d="M19.1641 27.7461V39.6964C19.1641 41.4828 20.6122 42.9309 22.3986 42.9309C24.185 42.9309 25.6332 41.4828 25.6332 39.6964V25.7325H21.1777C20.0656 25.7325 19.1641 26.634 19.1641 27.7461Z"
                  fill="#F2B66D"
                />
                <path
                  d="M34.4669 31.5819C34.0625 31.1147 30.8398 29.4076 30.8398 25.3221V22.4386H38.094V25.3221C38.094 29.4055 34.8834 31.1007 34.4669 31.5819Z"
                  fill="#F2B66D"
                />
                <path
                  d="M40.8247 18.7708H27.6482C26.3736 18.7708 25.3363 19.808 25.3363 21.0826V25.4341H21.1794C19.9044 25.4341 18.8672 26.4713 18.8672 27.746V39.6965C18.8672 41.6433 20.4505 43.2275 22.3974 43.229C22.3976 43.229 22.3978 43.2291 22.3981 43.2291H39.6019C41.5308 43.2291 43.1366 41.6735 43.1366 39.6945V21.0826C43.1366 19.808 42.0993 18.7708 40.8247 18.7708ZM22.3991 42.6327C20.7803 42.6321 19.4637 41.3152 19.4637 39.6966V27.746C19.4637 26.8003 20.2332 26.0306 21.1794 26.0306H25.3363C25.3358 28.8427 25.3383 39.4859 25.3337 39.749C25.3047 41.3625 23.9789 42.6327 22.3991 42.6327ZM42.5401 39.6946C42.5401 41.3599 41.1826 42.6328 39.6019 42.6328H24.364C25.3159 41.9927 25.9124 40.9291 25.9301 39.7489C25.934 39.4801 25.9328 21.2069 25.9328 21.0827C25.9328 20.137 26.7023 19.3673 27.6482 19.3673H40.8247C41.7704 19.3673 42.5401 20.1369 42.5401 21.0827V39.6946Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M40.3762 39.2631H32.9858C32.821 39.2631 32.6875 39.3966 32.6875 39.5614C32.6875 39.7262 32.821 39.8597 32.9858 39.8597H40.3762C40.541 39.8597 40.6745 39.7262 40.6745 39.5614C40.6745 39.3966 40.541 39.2631 40.3762 39.2631Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M31.4978 39.2631H28.9741C28.8092 39.2631 28.6758 39.3966 28.6758 39.5614C28.6758 39.7262 28.8092 39.8597 28.9741 39.8597H31.4978C31.6626 39.8597 31.7961 39.7262 31.7961 39.5614C31.7961 39.3966 31.6626 39.2631 31.4978 39.2631Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M40.3766 36.6442H38.2397C38.0749 36.6442 37.9414 36.7777 37.9414 36.9425C37.9414 37.1074 38.0749 37.2408 38.2397 37.2408H40.3766C40.5414 37.2408 40.6749 37.1074 40.6749 36.9425C40.6749 36.7776 40.5414 36.6442 40.3766 36.6442Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M28.9741 37.2407H36.3523C36.5171 37.2407 36.6506 37.1073 36.6506 36.9424C36.6506 36.7776 36.5171 36.6441 36.3523 36.6441H28.9741C28.8092 36.6441 28.6758 36.7776 28.6758 36.9424C28.6758 37.1074 28.8091 37.2407 28.9741 37.2407Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M40.3756 34.0252H32.4975C32.3327 34.0252 32.1992 34.1587 32.1992 34.3235C32.1992 34.4884 32.3327 34.6218 32.4975 34.6218H40.3756C40.5404 34.6218 40.6739 34.4884 40.6739 34.3235C40.6739 34.1587 40.5404 34.0252 40.3756 34.0252Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M28.9741 34.6218H31.032C31.1969 34.6218 31.3303 34.4884 31.3303 34.3235C31.3303 34.1587 31.1969 34.0252 31.032 34.0252H28.9741C28.8092 34.0252 28.6758 34.1587 28.6758 34.3235C28.6758 34.4884 28.8091 34.6218 28.9741 34.6218Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M34.2428 31.7771C34.3611 31.9144 34.575 31.9148 34.6937 31.7771C35.0694 31.3437 38.3936 29.5553 38.3936 25.3223V22.4386C38.3936 22.2737 38.2602 22.1403 38.0954 22.1403H30.8413C30.6764 22.1403 30.543 22.2737 30.543 22.4386V25.3222C30.5429 29.5689 33.8831 31.3608 34.2428 31.7771ZM31.1394 22.7369H37.7971V25.3223C37.7971 28.0965 36.4022 29.6119 34.4676 31.181C32.6375 29.7116 31.1394 28.2071 31.1394 25.3223V22.7369Z"
                  fill="#FEF8F0"
                />
                <path
                  d="M33.8758 27.4099L36.0287 25.9387C36.1647 25.8458 36.1998 25.6602 36.1065 25.5242C36.0142 25.3884 35.8287 25.3535 35.6921 25.4464L33.7733 26.7577L33.3169 26.158C33.217 26.0269 33.03 26.0016 32.8989 26.1012C32.7678 26.2012 32.7425 26.3881 32.8421 26.5192L33.4701 27.3444C33.5663 27.4707 33.7445 27.4997 33.8758 27.4099Z"
                  fill="#FEF8F0"
                />
              </g>
              <defs>
                <clipPath id="clip0_322_38696">
                  <rect
                    width="26"
                    height="26"
                    fill="white"
                    transform="translate(18 18)"
                  />
                </clipPath>
              </defs>
            </svg>

            <div className="flex flex-col gap-2 flex-1">
              <h1 className="text-white text-[18px] font-bold leading-7 tracking-normal font-archivo">
                Cookie Policy
              </h1>
              <p className="text-primary-100 text-[14px] font-normal leading-5 tracking-normal">
                We use cookies to enhance your experience, analyze site usage,
                and assist in our marketing efforts.{" "}
                <Link href="/cookie-policy" className="font-bold underline text-secondary">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex flex-wrap xl:flex-nowrap gap-3 items-center md:justify-end">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-transparent border border-secondary text-secondary text-[18px] font-normal leading-7 tracking-normal py-3.5 px-6 rounded-full hover:bg-secondary/10 hover:cursor-pointer transition font-archivo"
            >
              Manage Preference
            </button>
            <button
              onClick={handleDecline}
              className="bg-transparent border border-primary-100 text-primary-100 text-[18px] font-normal leading-7 tracking-normal py-3.5 px-6 rounded-full hover:bg-white/10 hover:cursor-pointer transition font-archivo"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptAll}
              className="bg-secondary text-primary text-[18px] leading-7 tracking-normal font-medium rounded-full px-6 py-3.5 transition-all duration-200 hover:bg-secondary/90 hover:cursor-pointer font-archivo"
            >
              Accept All
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
