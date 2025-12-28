// app/calendar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { EventInput } from "@fullcalendar/core";

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    allDay: false,
    color: "#3788d8",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data: CalendarEvent[] = await res.json();
      
      // Transform data for FullCalendar
      const transformedEvents: EventInput[] = data.map((event) => ({
        id: event._id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        backgroundColor: event.color,
        borderColor: event.color,
        extendedProps: {
          description: event.description,
        },
      }));
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const calendar = selectInfo.view.calendar;
    calendar.unselect();

    // Format dates properly for datetime-local input
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    
    // If all day, set end to same day at 23:59
    if (selectInfo.allDay) {
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 0, 0);
    }

    setEditingEventId(null);
    setFormData({
      title: "",
      description: "",
      start: formatDateTimeLocal(startDate),
      end: formatDateTimeLocal(endDate),
      allDay: selectInfo.allDay,
      color: "#3788d8",
    });
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      description: event.extendedProps.description || "",
      start: formatDateTimeLocal(event.start),
      end: formatDateTimeLocal(event.end || event.start),
      allDay: event.allDay,
      color: event.backgroundColor || "#3788d8",
    });
    setDialogOpen(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const event = dropInfo.event;
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: event.start?.toISOString(),
          end: event.end?.toISOString() || event.start?.toISOString(),
          allDay: event.allDay,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update event');
      }

      await fetchEvents();
    } catch (error) {
      console.error("Failed to update event:", error);
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo: any) => {
    const event = resizeInfo.event;
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: event.start?.toISOString(),
          end: event.end?.toISOString() || event.start?.toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update event');
      }

      await fetchEvents();
    } catch (error) {
      console.error("Failed to update event:", error);
      resizeInfo.revert();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate end time is after start time
    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (endDate <= startDate) {
      alert("End time must be after start time");
      return;
    }

    try {
      if (editingEventId) {
        // Update existing event
        const res = await fetch(`/api/events/${editingEventId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            start: new Date(formData.start).toISOString(),
            end: new Date(formData.end).toISOString(),
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to update event');
        }
      } else {
        // Create new event
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            start: new Date(formData.start).toISOString(),
            end: new Date(formData.end).toISOString(),
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to create event');
        }
      }
      
      setDialogOpen(false);
      await fetchEvents();
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!editingEventId) return;

    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${editingEventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      setDialogOpen(false);
      await fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  // Helper function to format date for datetime-local input
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Event Calendar</h1>

        <div className="bg-card rounded-lg shadow-lg p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            eventDisplay="block"
            displayEventTime={true}
            displayEventEnd={true}
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEventId ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="start">Start *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end">End *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    required
                    min={formData.start}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="allDay"
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="allDay" className="cursor-pointer">All Day Event</Label>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">{formData.color}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6 gap-2">
                {editingEventId && (
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingEventId ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}