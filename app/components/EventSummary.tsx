"use client";

import { EventSummary as EventSummaryType, ItemCategory } from "@/app/types";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ReceiptIcon,
} from "@heroicons/react/24/outline";

interface EventSummaryProps {
  summary: EventSummaryType;
}

export default function EventSummary({ summary }: EventSummaryProps) {
  const categoryColors = {
    [ItemCategory.FOOD]: "bg-green-500",
    [ItemCategory.DRINKS]: "bg-blue-500",
    [ItemCategory.SUPPLIES]: "bg-yellow-500",
    [ItemCategory.EQUIPMENT]: "bg-purple-500",
    [ItemCategory.TRAVEL]: "bg-red-500",
    [ItemCategory.OTHER]: "bg-gray-500",
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Event Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 flex items-center">
          <CurrencyDollarIcon className="h-8 w-8 text-primary-400 mr-3" />
          <div>
            <p className="text-sm text-gray-400">Total Amount</p>
            <p className="text-xl font-bold">
              ${summary.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 flex items-center">
          <ReceiptIcon className="h-8 w-8 text-primary-400 mr-3" />
          <div>
            <p className="text-sm text-gray-400">Receipts</p>
            <p className="text-xl font-bold">{summary.receiptCount}</p>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 flex items-center">
          <ChartBarIcon className="h-8 w-8 text-primary-400 mr-3" />
          <div>
            <p className="text-sm text-gray-400">Categories</p>
            <p className="text-xl font-bold">
              {Object.keys(summary.categoryBreakdown).length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Category Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(summary.categoryBreakdown).map(
            ([category, amount]) =>
              amount > 0 && (
                <div key={category} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      categoryColors[category as ItemCategory] || "bg-gray-500"
                    } mr-2`}
                  ></div>
                  <span className="flex-1">{category}</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              )
          )}
        </div>

        {Object.keys(summary.vendorBreakdown).length > 0 && (
          <>
            <h3 className="text-lg font-medium mt-6">Vendor Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(summary.vendorBreakdown).map(
                ([vendor, amount]) => (
                  <div key={vendor} className="flex items-center">
                    <span className="flex-1">{vendor}</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
