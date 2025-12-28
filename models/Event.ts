// models/Event.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  userId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#3788d8',
    },
  },
  {
    timestamps: true,
  }
);

export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);