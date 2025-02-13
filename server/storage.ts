import { Task, InsertTask } from "@shared/schema";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  reorderTasks(orderedIds: number[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private currentId: number;

  constructor() {
    this.tasks = new Map();
    this.currentId = 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => a.order - b.order);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const order = this.tasks.size;
    const task: Task = { 
      ...insertTask, 
      id, 
      order,
      dueDate: insertTask.dueDate ? new Date(insertTask.dueDate) : null,
      description: insertTask.description || null 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, update: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");

    const updatedTask = { 
      ...task, 
      ...update,
      dueDate: update.dueDate ? new Date(update.dueDate) : task.dueDate,
      description: update.description ?? task.description
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    if (!this.tasks.delete(id)) {
      throw new Error("Task not found");
    }
  }

  async reorderTasks(orderedIds: number[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const task = this.tasks.get(id);
      if (task) {
        this.tasks.set(id, { ...task, order: index });
      }
    });
  }
}

export const storage = new MemStorage();