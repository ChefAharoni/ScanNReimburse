import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Event } from "@/app/types";
import { readData, saveData } from "@/app/lib/storage";

const EVENTS_FILE = "events.json";

// GET /api/events - List all events
export async function GET() {
  try {
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    // Read existing events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Create new event
    const newEvent: Event = {
      id: uuidv4(),
      name: name.trim(),
      receiptCount: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to events list
    events.push(newEvent);

    // Save updated events
    await saveData(events, EVENTS_FILE);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
