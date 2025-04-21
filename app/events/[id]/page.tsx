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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event");
        }
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Calculate summary
        const receipts = eventData.receipts || [];
        const totalAmount = receipts.reduce(
          (sum: number, receipt: any) => sum + receipt.totalAmount,
          0
        );

        const categoryBreakdown = receipts.reduce((acc: any, receipt: any) => {
          receipt.items.forEach((item: any) => {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
          });
          return acc;
        }, {});

        const vendorBreakdown = receipts.reduce((acc: any, receipt: any) => {
          acc[receipt.vendor] =
            (acc[receipt.vendor] || 0) + receipt.totalAmount;
          return acc;
        }, {});

        setSummary({
          totalAmount,
          receiptCount: receipts.length,
          categoryBreakdown,
          vendorBreakdown,
        });
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch event data"
        );
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
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
