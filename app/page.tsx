"use client";

import { useState } from "react";
import EventList from "./components/EventList";
import CreateEventModal from "./components/CreateEventModal";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ScanNReimburse</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Event
        </button>
      </div>

      <EventList />

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
