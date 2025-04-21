import { NextRequest, NextResponse } from "next/server";
import { Event, Receipt } from "@/app/types";
import { readData, getFilePath } from "@/app/lib/storage";
import fs from "fs";

const EVENTS_FILE = "events.json";

// GET /api/events/[id]/receipts/[receiptId]/download - Download a receipt file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; receiptId: string } }
) {
  try {
    const { id, receiptId } = params;

    // Read events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Find the event
    const event = events.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Find the receipt
    const receipt = event.receipts?.find((r) => r.id === receiptId);

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Get the file path
    const filePath = getFilePath(receipt.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Receipt file not found" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileExtension = receipt.filePath.split(".").pop() || "pdf";
    const contentType = getContentType(fileExtension);

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="receipt-${receiptId}.${fileExtension}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading receipt:", error);
    return NextResponse.json(
      { error: "Failed to download receipt" },
      { status: 500 }
    );
  }
}

// Helper function to get content type based on file extension
function getContentType(fileExtension: string): string {
  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };

  return (
    contentTypes[fileExtension.toLowerCase()] || "application/octet-stream"
  );
}
