"use client";

import { useState } from "react";
import { FolderIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  receiptCount: number;
  totalAmount: number;
  createdAt: string;
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleDelete = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      // TODO: Implement delete functionality
      setEvents(events.filter((event) => event.id !== eventId));
    }
  };

  const handleRename = async (event: Event, newName: string) => {
    // TODO: Implement rename functionality
    setEvents(
      events.map((e) => (e.id === event.id ? { ...e, name: newName } : e))
    );
    setEditingEvent(null);
  };

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
                  autoFocus
                />
              ) : (
                <h3 className="text-lg font-medium">{event.name}</h3>
              )}
              <p className="text-sm text-gray-400">
                {event.receiptCount} receipts • ${event.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingEvent(event)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="p-1 hover:bg-gray-700 rounded text-red-400"
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
