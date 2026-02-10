
export interface Exercise {
  id: string;
  name: string;
  targetReps: number;
  targetWeight: number;
  sets: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  lastPerformed?: string;
}

export interface ExerciseSession {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  note?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  workoutId: string;
  exercises: ExerciseSession[];
}

export interface BodyWeightEntry {
  date: string;
  weight: number;
}

export type AppView = 'DASHBOARD' | 'EDITOR' | 'SESSION' | 'ANALYTICS';
