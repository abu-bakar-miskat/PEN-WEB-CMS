"use client";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  declineAllCookies,
  getCookieConsentData,
  ICookiePreferences,
  savePreferences,
} from "@/lib/cookieConsent";
import { XIcon } from "lucide-react";

interface CookiePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CookiePreferencesDialog({
  open,
  onOpenChange,
}: CookiePreferencesDialogProps) {
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [essential, setEssential] = useState(false);

  useEffect(() => {
    const consentData = getCookieConsentData();
    if (consentData) {
      setMarketing(consentData.marketing);
      setAnalytics(consentData.analytics);
      setFunctional(consentData.functional);
      setEssential(consentData.essential);
    }
  }, [open]);

  const handleSavePreferences = () => {
    // Save preferences logic here
    const preferences: ICookiePreferences = {
      marketing,
      analytics,
      functional,
      essential,
    };
    savePreferences(preferences);
    onOpenChange(false);
  };

  const handleDeny = () => {
    // Close dialog and deny all cookies
    declineAllCookies();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="Cookie preferences dialog"
        showCloseButton={false}
        className="bg-secondary-50 z-2000 px-12 py-10 rounded-[32px] w-full lg:max-w-175 xl:max-w-250 border-none shadow-none"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-primary font-archivo text-[36px] font-semibold leading-12 tracking-normal">
            Cookie Preferences
          </DialogTitle>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity focus:outline-none">
            <XIcon className="h-7 w-7 text-primary" />
          </DialogClose>
        </div>

        <div className="space-y-0 mb-8 w-full border-t border-secondary-200">
          {/* Essential Cookies */}
          <div className="flex items-center justify-between py-5 border-b border-secondary-200">
            <div>
              <h3 className="text-primary font-archivo text-[30px] font-semibold leading-10 tracking-normal mb-1">
                Essential Cookies
              </h3>
              <p className="text-primary-300 font-inter text-[18px] font-normal leading-8 tracking-normal">
                Required for basic functionality
              </p>
            </div>
            <div
              className={`w-16 h-8 rounded-full relative shrink-0 ml-6 bg-secondary-200 opacity-60 cursor-not-allowed`}
              aria-label="Toggle Essential (Disabled)"
            >
              <span
                className={`absolute top-0.75 right-0.75 w-6.5 h-6.5 bg-secondary rounded-full`}
              />
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="flex items-center justify-between py-6 border-b border-secondary-200">
            <div>
              <h3 className="text-primary font-archivo text-[30px] font-semibold leading-10 tracking-normal mb-1">
                Functional Cookies
              </h3>
              <p className="text-primary-300 font-inter text-[18px] font-normal leading-8 tracking-normal">
                Enhanced website features
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFunctional(!functional)}
              className={`w-16 h-8 rounded-full transition-all duration-300 ease-out relative shrink-0 ml-6 ${
                functional ? "bg-secondary-200" : "bg-primary-100"
              }`}
              aria-label="Toggle Functional"
            >
              <span
                className={`absolute top-0.75 w-6.5 h-6.5 rounded-full transition-all duration-300 ease-out ${
                  functional ? "right-0.75 bg-secondary" : "left-0.75 bg-white"
                }`}
              />
            </button>
          </div>

          {/* Analytics Cookies */}
          <div className="flex items-center justify-between py-6 border-b border-secondary-200">
            <div>
              <h3 className="text-primary font-archivo text-[30px] font-semibold leading-10 tracking-normal mb-1">
                Analytics Cookies
              </h3>
              <p className="text-primary-300 font-inter text-[18px] font-normal leading-8 tracking-normal">
                Help us improve our website
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnalytics(!analytics)}
              className={`w-16 h-8 rounded-full transition-all duration-300 ease-out relative shrink-0 ml-6 ${
                analytics ? "bg-secondary-200" : "bg-primary-100"
              }`}
              aria-label="Toggle Analytics"
            >
              <span
                className={`absolute top-0.75 w-6.5 h-6.5 rounded-full transition-all duration-300 ease-out ${
                  analytics ? "right-0.75 bg-secondary" : "left-0.75 bg-white"
                }`}
              />
            </button>
          </div>

          {/* Marketing Cookies */}
          <div className="flex items-center justify-between py-6 border-b border-secondary-200">
            <div>
              <h3 className="text-primary font-archivo text-[30px] font-semibold leading-10 tracking-normal mb-1">
                Marketing Cookies
              </h3>
              <p className="text-primary-300 font-inter text-[18px] font-normal leading-8 tracking-normal">
                Personalized advertising
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMarketing(!marketing)}
              className={`w-16 h-8 rounded-full transition-all duration-300 ease-out relative shrink-0 ml-6 ${
                marketing ? "bg-secondary-200" : "bg-primary-100"
              }`}
              aria-label="Toggle Marketing"
            >
              <span
                className={`absolute top-0.75 w-6.5 h-6.5 rounded-full transition-all duration-300 ease-out ${
                  marketing ? "right-0.75 bg-secondary" : "left-0.75 bg-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mt-4">
          <button
            onClick={handleSavePreferences}
            className="font-archivo bg-secondary text-primary text-[18px] leading-7 tracking-normal font-medium rounded-full px-6 py-3.5 transition-all duration-200 hover:bg-secondary/90 hover:cursor-pointer"
          >
            Save Preference
          </button>
          <button
            onClick={handleDeny}
            className="font-archivo bg-transparent text-primary border border-primary px-6 py-3.5 rounded-full text-[18px] font-normal hover:bg-primary hover:text-white transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
