export interface Task {
  title: string;
  deadline: string;
  id?: string | undefined;
  _id?: string | undefined;
  name?: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  image?: File;
}

export interface TaskResponse {
  tasks: Task[];
  totalItems: number;
  message?: string;
}

// task-create.model.ts
export interface TaskCreate {
  title: string;
  userId: string | number;
  description: string;
  deadline: string | Date;
  image?: File;
}

export interface TaskUpdate {
  id: number;
  name?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
}
