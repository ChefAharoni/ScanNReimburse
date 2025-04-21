"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ReceiptList from "@/app/components/ReceiptList";
import UploadReceiptModal from "@/app/components/UploadReceiptModal";
import EventSummary from "@/app/components/EventSummary";
import { Event, EventSummary as EventSummaryType } from "@/app/types";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [summary, setSummary] = useState<EventSummaryType | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement API call to fetch event data
        // For now, using mock data
        const mockEvent: Event = {
          id: eventId,
          name: "Sample Event",
          receiptCount: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockSummary: EventSummaryType = {
          totalAmount: 0,
          receiptCount: 0,
          categoryBreakdown: {
            FOOD: 0,
            DRINKS: 0,
            SUPPLIES: 0,
            EQUIPMENT: 0,
            TRAVEL: 0,
            OTHER: 0,
          },
          vendorBreakdown: {},
        };

        setEvent(mockEvent);
        setSummary(mockSummary);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-300">Event not found</h3>
        <Link
          href="/"
          className="mt-4 inline-flex items-center text-primary-400 hover:text-primary-300"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-2"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-sm text-gray-400">
            Created on {new Date(event.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Upload Receipt
        </button>
      </div>

      {summary && <EventSummary summary={summary} />}

      <ReceiptList eventId={eventId} />

      <UploadReceiptModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        eventId={eventId}
      />
    </div>
  );
}
