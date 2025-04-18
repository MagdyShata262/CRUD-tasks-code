export interface Task {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
}

export interface TaskResponse {
  tasks: Task[];
  totalCount: number;
  message: string;
}

export interface TaskCreate {
  name: string;
  description: string;
  completed?: boolean;
  userId?: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
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
