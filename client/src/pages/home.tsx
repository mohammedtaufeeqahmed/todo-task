import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import TaskFilters from "@/components/task-filters";
import ThemeToggle from "@/components/theme-toggle";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
  });

  const [categories, setCategories] = useState<string[]>([
    "default",
    "work",
    "personal",
    "shopping",
    "health",
  ]);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      await apiRequest("POST", "/api/tasks/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderMutation.mutate(items.map(task => task.id));
  };

  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.category !== "all" && task.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-primary">Tasks</h1>
          <ThemeToggle />
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <TaskForm categories={categories} onAddCategory={addCategory} />
            <TaskFilters 
              filters={filters} 
              setFilters={setFilters} 
              categories={categories}
            />
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <TaskList tasks={filteredTasks} isLoading={isLoading} />
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}