"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ReceiptList from "@/app/components/ReceiptList";
import UploadReceiptModal from "@/app/components/UploadReceiptModal";
import EventSummary from "@/app/components/EventSummary";
import {
  Event,
  EventSummary as EventSummaryType,
  ItemCategory,
  Receipt,
} from "@/app/types";

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
        const eventResponse = await fetch(`/api/events/${eventId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event");
        }

        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Fetch receipts if not included in the event data
        let receipts = eventData.receipts || [];
        if (!receipts.length) {
          const receiptsResponse = await fetch(
            `/api/events/${eventId}/receipts`,
            {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          if (receiptsResponse.ok) {
            receipts = await receiptsResponse.json();
          }
        }

        // Calculate summary
        const totalAmount = receipts.reduce(
          (sum: number, receipt: Receipt) => sum + (receipt.totalAmount || 0),
          0
        );

        // Initialize category breakdown object with all categories
        const categoryBreakdown: { [key in ItemCategory]?: number } = {};
        Object.values(ItemCategory).forEach((category) => {
          categoryBreakdown[category] = 0;
        });

        // Calculate category and vendor breakdowns
        const vendorBreakdown: { [vendor: string]: number } = {};

        receipts.forEach((receipt: Receipt) => {
          // Add vendor to breakdown
          const vendorName = receipt.vendorName || "Unknown";
          vendorBreakdown[vendorName] =
            (vendorBreakdown[vendorName] || 0) + (receipt.totalAmount || 0);

          // Add categories to breakdown
          if (receipt.items && Array.isArray(receipt.items)) {
            receipt.items.forEach((item) => {
              if (item.category) {
                const amount = (item.price || 0) * (item.quantity || 1);
                categoryBreakdown[item.category] =
                  (categoryBreakdown[item.category] || 0) + amount;
              }
            });
          }
        });

        setSummary({
          totalAmount,
          receiptCount: receipts.length,
          categoryBreakdown: categoryBreakdown as {
            [key in ItemCategory]: number;
          },
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

    // Set up an interval to refresh the data
    const intervalId = setInterval(fetchEventData, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
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
