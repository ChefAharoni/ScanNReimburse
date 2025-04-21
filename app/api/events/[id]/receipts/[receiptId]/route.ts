import { NextRequest, NextResponse } from "next/server";
import { Event, Receipt } from "@/app/types";
import { readData, saveData, deleteFile } from "@/app/lib/storage";

const EVENTS_FILE = "events.json";

// GET /api/events/[id]/receipts/[receiptId] - Get a specific receipt
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

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/receipts/[receiptId] - Update a receipt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; receiptId: string } }
) {
  try {
    const { id, receiptId } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const data = formData.get("data") as string;

    if (!data) {
      return NextResponse.json(
        { error: "Receipt data is required" },
        { status: 400 }
      );
    }

    // Parse receipt data
    const receiptData = JSON.parse(data) as Omit<
      Receipt,
      "id" | "eventId" | "filePath" | "createdAt" | "updatedAt"
    >;

    // Read events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Find the event
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Find the receipt
    const receiptIndex =
      events[eventIndex].receipts?.findIndex((r) => r.id === receiptId) ?? -1;

    if (receiptIndex === -1) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Get current receipt
    const currentReceipt = events[eventIndex].receipts![receiptIndex];

    // Handle file update if provided
    let filePath = currentReceipt.filePath;
    if (file) {
      // Delete old file
      await deleteFile(currentReceipt.filePath);
      // Save new file
      filePath = await saveFile(file);
    }

    // Update receipt
    const updatedReceipt: Receipt = {
      ...currentReceipt,
      ...receiptData,
      filePath,
      updatedAt: new Date().toISOString(),
    };

    // Update receipt in event
    events[eventIndex].receipts![receiptIndex] = updatedReceipt;

    // Save updated events
    await saveData(events, EVENTS_FILE);

    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/receipts/[receiptId] - Delete a receipt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; receiptId: string } }
) {
  try {
    const { id, receiptId } = params;

    // Read events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Find the event
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Find the receipt
    const receiptIndex =
      events[eventIndex].receipts?.findIndex((r) => r.id === receiptId) ?? -1;

    if (receiptIndex === -1) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Get receipt to delete its file
    const receipt = events[eventIndex].receipts![receiptIndex];

    // Delete the file
    await deleteFile(receipt.filePath);

    // Remove receipt from event
    events[eventIndex].receipts = events[eventIndex].receipts!.filter(
      (r) => r.id !== receiptId
    );

    // Save updated events
    await saveData(events, EVENTS_FILE);

    return NextResponse.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json(
      { error: "Failed to delete receipt" },
      { status: 500 }
    );
  }
}
