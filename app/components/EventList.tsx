"use client";

import { useState, useEffect } from "react";
import { FolderIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  name: string;
  receiptCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  receipts?: any[];
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/events", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      // Calculate receipt counts and total amounts if not already provided
      const processedEvents = data.map((event: Event) => {
        if (event.receipts) {
          const receiptCount = event.receipts.length;
          const totalAmount = event.receipts.reduce(
            (sum: number, receipt: any) => sum + (receipt.totalAmount || 0),
            0
          );
          return { ...event, receiptCount, totalAmount };
        }
        return event;
      });

      setEvents(processedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Set up an interval to refresh the data every 5 seconds
    const intervalId = setInterval(fetchEvents, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      await fetchEvents();
      router.refresh();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  const handleRename = async (event: Event, newName: string) => {
    if (!newName.trim() || newName === event.name) {
      setEditingEvent(null);
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename event");
      }

      await fetchEvents();
      setEditingEvent(null);
      router.refresh();
    } catch (err) {
      console.error("Error renaming event:", err);
      alert("Failed to rename event");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-4 text-primary-400 hover:text-primary-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-300">No events</h3>
        <p className="mt-1 text-sm text-gray-400">
          Get started by creating a new event.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <div key={event.id} className="card">
          <div className="flex justify-between items-start">
            <div>
              {editingEvent?.id === event.id ? (
                <input
                  type="text"
                  className="input-field"
                  defaultValue={event.name}
                  onBlur={(e) => handleRename(event, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename(event, e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setEditingEvent(null);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <h3 className="text-lg font-medium">{event.name}</h3>
              )}
              <p className="text-sm text-gray-400">
                {event.receiptCount || 0} receipts • $
                {(event.totalAmount || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingEvent(event)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Rename"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="p-1 hover:bg-gray-700 rounded text-red-400"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="mt-4 block text-primary-400 hover:text-primary-300 text-sm"
          >
            View details →
          </Link>
        </div>
      ))}
    </div>
  );
}
