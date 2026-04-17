"use client";

import { SettingsForm } from "@/components/SettingsForm";
import { SessionSettings } from "@/types";
import { X } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SessionSettings;
  onSave: (settings: SessionSettings) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <SettingsForm
          settings={settings}
          onCancel={onClose}
          onSave={(updatedSettings) => {
            onSave(updatedSettings);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
