import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface ITask extends Document {
  owner: mongoose.Types.ObjectId;
  created_by: {
    id: string;
    name: string;
    email: string;
  };
  task_name: string;
  task_deadline: Date | null;
  status: TaskStatus;
  task_description?: string;
  createdAt: Date; // alias for created_on
  updatedAt: Date; // alias for updated_on
}

const TaskSchema = new Schema<ITask>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    created_by: { type: String, required: true },
    task_name: { type: String, required: true, trim: true },
    task_deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    task_description: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Optional: enforce index for faster owner+status lookups later
TaskSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
