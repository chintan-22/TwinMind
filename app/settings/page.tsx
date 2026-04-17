"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { SettingsForm } from "@/components/SettingsForm";
import { SessionSettings } from "@/types";
import {
  getServerSettingsSnapshot,
  getStoredSettings,
  saveSettings,
  subscribeToSettings,
} from "@/lib/settingsStore";

export default function SettingsPage() {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getStoredSettings,
    getServerSettingsSnapshot
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = (updatedSettings: SessionSettings) => {
    saveSettings(updatedSettings);
    setSavedMessage("Settings saved. You can go back to the app now.");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Configure your Groq key, models, and prompt preferences.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back to app
          </Link>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={16} />
            {savedMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SettingsForm settings={settings} onSave={handleSave} />
        </section>
      </div>
    </main>
  );
}
