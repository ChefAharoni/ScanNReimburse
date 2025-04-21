import { NextRequest, NextResponse } from "next/server";
import { Event, Receipt } from "@/app/types";
import { readData, saveData, saveFile, deleteFile } from "@/app/lib/storage";

const EVENTS_FILE = "events.json";

// GET /api/events/[id]/receipts - List all receipts for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Read events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Find the event
    const event = events.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event.receipts || []);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/receipts - Add a receipt to an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const data = formData.get("data") as string;

    if (!file || !data) {
      return NextResponse.json(
        { error: "File and receipt data are required" },
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

    // Save the file
    const filePath = await saveFile(file);

    // Create new receipt
    const newReceipt: Receipt = {
      ...receiptData,
      id: crypto.randomUUID(),
      eventId: id,
      filePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add receipt to event
    events[eventIndex].receipts = [
      ...(events[eventIndex].receipts || []),
      newReceipt,
    ];

    // Save updated events
    await saveData(events, EVENTS_FILE);

    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error("Error adding receipt:", error);
    return NextResponse.json(
      { error: "Failed to add receipt" },
      { status: 500 }
    );
  }
}
