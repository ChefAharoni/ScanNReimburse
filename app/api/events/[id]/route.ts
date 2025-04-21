import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/app/types";
import { readData, saveData } from "@/app/lib/storage";

const EVENTS_FILE = "events.json";

// GET /api/events/[id] - Get a specific event
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

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update a specific event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    // Read events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Find the event index
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Update the event
    events[eventIndex] = {
      ...events[eventIndex],
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    // Save updated events
    await saveData(events, EVENTS_FILE);

    return NextResponse.json(events[eventIndex]);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete a specific event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Read events
    const events = (await readData<Event[]>(EVENTS_FILE)) || [];

    // Find the event index
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Remove the event
    events.splice(eventIndex, 1);

    // Save updated events
    await saveData(events, EVENTS_FILE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
