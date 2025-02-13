import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"),
  category: text("category").notNull().default("default"),
  status: text("status").notNull().default("todo"),
  order: integer("order").notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, order: true })
  .extend({
    title: z.string().min(1, "Title is required"),
    priority: z.enum(["low", "medium", "high"]),
    category: z.string().min(1),
    status: z.enum(["todo", "in-progress", "done"]),
    dueDate: z.string().nullable().transform(val => val ? new Date(val) : null),
  });

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;