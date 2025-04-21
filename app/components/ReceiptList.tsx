"use client";

import { useState, useEffect } from "react";
import { Receipt, ItemCategory } from "@/app/types";
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface ReceiptListProps {
  eventId: string;
}

export default function ReceiptList({ eventId }: ReceiptListProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement API call to fetch receipts
        // For now, using mock data
        const mockReceipts: Receipt[] = [];
        setReceipts(mockReceipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, [eventId]);

  const handleDelete = async (receiptId: string) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      // TODO: Implement delete functionality
      setReceipts(receipts.filter((receipt) => receipt.id !== receiptId));
    }
  };

  const handleDownload = async (receipt: Receipt) => {
    // TODO: Implement download functionality
    console.log("Downloading receipt:", receipt.id);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
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
      <h2 className="text-xl font-semibold">Receipts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receipts.map((receipt) => (
          <div key={receipt.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{receipt.vendorName}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(receipt.date).toLocaleDateString()}
                </p>
                <p className="text-lg font-bold mt-1">
                  ${receipt.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(receipt)}
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
              <div className="space-y-1">
                {receipt.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full ${getCategoryColor(
                          item.category
                        )} mr-2`}
                      ></span>
                      {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
