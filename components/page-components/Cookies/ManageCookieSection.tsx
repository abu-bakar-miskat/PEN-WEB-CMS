"use client";
import { useState } from "react";
import CookiePreferencesDialog from "./CookiePreferenceDialog";

export default function ManageCookieSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <CookiePreferencesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <div className="mt-20">
        <div className="relative bg-[linear-gradient(96deg,#FEF8F0_3.47%,#FFDFC3_100%)] p-16 rounded-[32px] text-center">
          <h2 className="text-primary font-archivo text-[36px] leading-[46px] font-semibold mb-4">
            Manage Your Cookie Preferences
          </h2>
          <p className="max-w-[540px] mx-auto text-primary-300 font-inter text-[16px] leading-[26px] mb-8">
            You can review and change your cookie preferences at any time:
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-secondary text-primary font-archivo text-[18px] font-medium rounded-full px-8 py-3.5 transition-all duration-200 hover:bg-secondary/90 hover:cursor-pointer"
          >
            Manage Cookie Settings
          </button>
        </div>
      </div>
    </>
  );
}
