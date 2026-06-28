import {create} from 'zustand';
import {persist} from 'zustand/middleware/persist';
import type {Goal} from '../types/goal.ts';

type GoalState = {
	goals: Goal[];
	addGoal: (goal: Goal) => void;
	completeDay: (id: string, date: string) => void;
}

export const useStore = create<GoalState>()(persist((set) => ({
		goals:       [],
		addGoal:     (goal: Goal) => set((state) => ({goals: [...state.goals, goal]})),
		completeDay: (id: string, date: string) => set((state) => ({
			goals: state.goals.map(goal =>
				goal.id === id ? {...goal, completedDays: [...goal.completedDays, date]} : goal
			)
		}))
	}),
	{
		name: 'goal-store',
	}))