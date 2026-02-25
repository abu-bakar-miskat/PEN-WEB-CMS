import { readFile } from "fs/promises";
import { join } from "path";
import { BookOpen, Download } from "lucide-react";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import ManualViewer from "./ManualViewer";

export default async function UserManualPage() {
  let manualContent = "";
  let error: string | null = null;

  try {
    const manualPath = join(
      process.cwd(),
      "docs",
      "ADMIN_PANEL_USER_MANUAL.md",
    );
    manualContent = await readFile(manualPath, "utf-8");
  } catch (err) {
    error =
      "User manual not found. Please ensure the documentation file exists.";
    console.error("Error reading manual:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Manual</h1>
            <p className="text-slate-600 mt-1">
              Complete guide to using the Admin Panel
            </p>
          </div>
        </div>
        {manualContent && (
          <a href="/api/download-manual" download>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Manual
            </Button>
          </a>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <ManualViewer content={manualContent} />
      )}
    </div>
  );
}
