// app/api/events/[eventId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';

type Params = Promise<{ eventId: string }>;

// UPDATE event
export async function PATCH(req: Request, segmentData: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await segmentData.params;
    const { eventId } = params;
    const body = await req.json();

    await connectDB();
    const event = await Event.findOne({ _id: eventId, userId: session.user.id });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update fields
    if (body.title !== undefined) event.title = body.title;
    if (body.description !== undefined) event.description = body.description;
    if (body.start !== undefined) event.start = new Date(body.start);
    if (body.end !== undefined) event.end = new Date(body.end);
    if (body.allDay !== undefined) event.allDay = body.allDay;
    if (body.color !== undefined) event.color = body.color;

    await event.save();

    return NextResponse.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE event
export async function DELETE(req: Request, segmentData: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await segmentData.params;
    const { eventId } = params;

    await connectDB();
    const event = await Event.findOne({ _id: eventId, userId: session.user.id });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await event.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}