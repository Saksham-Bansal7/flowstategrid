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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
        throw new Error("Failed to update event");
      }

      await fetchEvents();
    } catch (error) {
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
        throw new Error("Failed to update event");
      }

      await fetchEvents();
    } catch (error) {
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
          throw new Error("Failed to update event");
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
          throw new Error("Failed to create event");
        }
      }

      setDialogOpen(false);
      await fetchEvents();
    } catch (error) {
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
        throw new Error("Failed to delete event");
      }

      setDialogOpen(false);
      await fetchEvents();
    } catch (error) {
      alert("Failed to delete event. Please try again.");
    }
  };

  // Helper function to format date for datetime-local input
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

// app/calendar/page.tsx - Replace the return section
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-0">
          Event Calendar
        </h1>

        <div className="bg-card rounded-lg shadow-lg p-1 sm:p-2 lg:p-4 overflow-hidden [&_.fc_.fc-col-header-cell]:bg-muted [&_.fc_.fc-col-header-cell]:text-foreground [&_.fc]:border-border">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "today",
            }}
            footerToolbar={{
              center: "dayGridMonth,timeGridWeek,listWeek",
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
            contentHeight="auto"
            aspectRatio={1.5}
            handleWindowResize={true}
            windowResizeDelay={100}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'short' },
                dayMaxEvents: 2,
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
                slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
              },
              listWeek: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
              }
            }}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              list: 'List',
            }}
            // Mobile-specific settings
            dayHeaderFormat={{ weekday: 'short' }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingEventId ? "Edit Event" : "Create Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Event title"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description (optional)"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="start" className="text-sm">Start *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="end" className="text-sm">End *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    required
                    min={formData.start}
                    className="text-sm"
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
                  <Label htmlFor="allDay" className="cursor-pointer text-sm">
                    All Day Event
                  </Label>
                </div>
                <div>
                  <Label htmlFor="color" className="text-sm">Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">{formData.color}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 sm:mt-6 gap-2 flex-col sm:flex-row">
                {editingEventId && (
                  <Button type="button" variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingEventId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}