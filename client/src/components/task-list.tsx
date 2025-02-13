import { Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { format } from "date-fns";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
};

export default function TaskList({ tasks, isLoading }: TaskListProps) {
  const { toast } = useToast();

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Droppable droppableId="tasks">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-4"
        >
          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
              {(provided) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-600 mb-4">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary" className={statusColors[task.status]}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline">{task.category}</Badge>
                          {task.dueDate && (
                            <Badge variant="outline">
                              Due: {format(new Date(task.dueDate), "PP")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask.mutate(task.id)}
                        disabled={deleteTask.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
