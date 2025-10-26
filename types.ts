export interface Course {
  id: string;
  name: string;
  teacherId: string;
  groupId: string;
  hours: number;
}

export interface Teacher {
  id: string;
  name: string;
  unavailableTimeSlots?: string[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface TimeSlot {
  id: string;
  day: string;
  time: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  size: number;
  unavailableTimeSlots?: string[];
}

export type Assignment = { [courseId: string]: { roomId: string; timeSlotId: string } };

export type Domain = { [courseId: string]: { roomId: string; timeSlotId: string }[] };

export enum Algorithm {
  BACKTRACKING_HEURISTICS = 'BACKTRACKING_HEURISTICS',
  FORWARD_CHECKING = 'FORWARD_CHECKING',
}

export interface SolverResult {
  solution: Assignment | null;
  stats: {
    timeTaken: number;
    nodesVisited: number;
  };
  expandedCourses: Course[];
}