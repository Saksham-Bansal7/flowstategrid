// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';

// GET all events for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const events = await Event.find({ userId: session.user.id }).sort({ start: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// CREATE new event
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, start, end, allDay, color } = body;

    if (!title || !start || !end) {
      return NextResponse.json({ error: 'Title, start, and end are required' }, { status: 400 });
    }

    await connectDB();
    const event = await Event.create({
      userId: session.user.id,
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      allDay: allDay || false,
      color: color || '#3788d8',
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}