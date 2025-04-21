"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
}: CreateEventModalProps) {
  const [eventName, setEventName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: eventName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      setEventName("");
      onClose();
      router.refresh();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="eventName"
              className="block text-sm font-medium mb-2"
            >
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="input-field w-full"
              placeholder="Enter event name"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !eventName.trim()}
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
