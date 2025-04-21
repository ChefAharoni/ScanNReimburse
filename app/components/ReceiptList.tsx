"use client";

import { useState, useEffect } from "react";
import { Receipt, ItemCategory } from "@/app/types";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface ReceiptListProps {
  eventId: string;
}

export default function ReceiptList({ eventId }: ReceiptListProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchReceipts();

    // Set up an interval to refresh the data
    const intervalId = setInterval(fetchReceipts, 5000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, [eventId]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/receipts`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch receipts");
      }

      const data = await response.json();
      setReceipts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;

    try {
      const response = await fetch(
        `/api/events/${eventId}/receipts/${receiptId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete receipt");
      }
      await fetchReceipts();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete receipt");
    }
  };

  const handleDownload = async (receiptId: string) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/receipts/${receiptId}/download`
      );
      if (!response.ok) {
        throw new Error("Failed to download receipt");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receiptId}.${
        response.headers.get("content-type")?.split("/")[1] || "pdf"
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download receipt"
      );
    }
  };

  const getCategoryColor = (category: ItemCategory) => {
    const colors = {
      [ItemCategory.FOOD]: "text-green-400",
      [ItemCategory.DRINKS]: "text-blue-400",
      [ItemCategory.SUPPLIES]: "text-yellow-400",
      [ItemCategory.EQUIPMENT]: "text-purple-400",
      [ItemCategory.TRAVEL]: "text-red-400",
      [ItemCategory.OTHER]: "text-gray-400",
    };
    return colors[category] || "text-gray-400";
  };

  if (loading && receipts.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && receipts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchReceipts}
          className="mt-4 text-primary-400 hover:text-primary-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-300">No receipts</h3>
        <p className="mt-1 text-sm text-gray-400">
          Upload a receipt to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Receipts</h2>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receipts.map((receipt) => (
          <div key={receipt.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">
                  {receipt.vendorName || "Unknown Vendor"}
                </h3>
                <p className="text-sm text-gray-400">
                  {receipt.date
                    ? new Date(receipt.date).toLocaleDateString()
                    : "No date"}
                </p>
                <p className="text-lg font-bold mt-1">
                  ${(receipt.totalAmount || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(receipt.id)}
                  className="p-1 hover:bg-gray-700 rounded text-primary-400"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingReceipt(receipt)}
                  className="p-1 hover:bg-gray-700 rounded"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="p-1 hover:bg-gray-700 rounded text-red-400"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Items</h4>
              {receipt.items && receipt.items.length > 0 ? (
                <div className="space-y-1">
                  {receipt.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex justify-between text-sm"
                    >
                      <span className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full ${getCategoryColor(
                            item.category
                          )} mr-2`}
                        ></span>
                        {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                      </span>
                      <span>
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No items found</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
