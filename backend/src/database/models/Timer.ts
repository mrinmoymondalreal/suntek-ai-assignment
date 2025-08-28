import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimer extends Document {
  task_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  started_by: {
    id: string;
    name: string;
    email: string;
  };
  start_time: Date;
  end_time: Date | null;
  duration_seconds: number; // calculated when timer stops
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimerSchema = new Schema<ITimer>(
  {
    task_id: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    started_by: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    start_time: { type: Date, required: true, default: Date.now },
    end_time: { type: Date, default: null },
    duration_seconds: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Indexes for efficient queries
TimerSchema.index({ task_id: 1, is_active: 1 });
TimerSchema.index({ user_id: 1, is_active: 1, start_time: -1 });

export const Timer: Model<ITimer> =
  mongoose.models.Timer || mongoose.model<ITimer>("Timer", TimerSchema);
