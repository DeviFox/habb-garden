import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Goal} from '../types/goal.ts';

type GoalPatch = Partial<Pick<Goal, 'name' | 'description' | 'goalTerm'>>;

export const REVIVE_COST     = 50;   // crystals per revival
const XP_PER_COMPLETED_DAY   = 10;
const XP_PER_COMPLETED_GOAL  = 100;

export type ViewMode = 'day' | 'night';

type GoalState = {
	goals:                Goal[];
	crystals:             number;
	freezesLeft:          number;
	userLevel:            number;
	userXp:               number;
	userXpMax:            number;
	userName:             string | null;
	onboardingCompleted:  boolean;
	viewMode:             ViewMode;
	celebrationFor:       string | null;     // id of a goal that just completed, triggers full-screen moment
	lastReward:           number;            // crystal reward granted on the pending celebration

	addGoal:                (goal: Goal) => void;
	completeDay:            (id: string, date: string) => void;
	freezeDay:              (id: string, date: string) => void;
	updateGoal:             (id: string, patch: GoalPatch) => void;
	killGoal:               (id: string) => void;
	reviveGoal:             (id: string) => boolean;
	addFreezes:             (count: number) => void;
	grantCrystals:          (amount: number) => void;
	setViewMode:            (mode: ViewMode) => void;
	clearCelebration:       () => void;
	setUserName:            (name: string) => void;
	completeOnboarding:     () => void;
}

export function completionReward(goalTerm: number): number {
	if (!Number.isFinite(goalTerm) || goalTerm <= 0) return 0;
	return goalTerm * 2;
}

function xpTable(level: number): number {
	return 100 + (level - 1) * 150;
}

function grantXp(state: GoalState, amount: number): Partial<GoalState> {
	let xp    = state.userXp + amount;
	let level = state.userLevel;
	let max   = state.userXpMax;
	while (xp >= max) {
		xp    -= max;
		level += 1;
		max    = xpTable(level);
	}
	return {userXp: xp, userLevel: level, userXpMax: max};
}

export const useGoalStore = create<GoalState>()(persist((set) => ({
		goals:               [],
		crystals:            120,                 // starter balance per mocks
		freezesLeft:         2,                   // global allowance per PRODUCT.md
		userLevel:           1,
		userXp:              0,
		userXpMax:           100,
		userName:            null,
		onboardingCompleted: false,
		viewMode:            'day',
		celebrationFor:      null,
		lastReward:          0,

		addGoal: (goal: Goal) => set((state) => ({
			goals: [...state.goals, goal]
		})),

		completeDay: (id: string, date: string) => set((state) => {
			const target = state.goals.find(g => g.id === id);
			if (!target || target.completedDays.includes(date)) return {};

			const nextCompleted = [...target.completedDays, date];
			const justCompleted = nextCompleted.length >= target.goalTerm && target.status === 'alive';

			const goals = state.goals.map(g =>
				g.id === id
					? {
						...g,
						completedDays: nextCompleted,
						status:        justCompleted ? 'completed' as const : g.status,
					}
					: g
			);

			const xp     = XP_PER_COMPLETED_DAY + (justCompleted ? XP_PER_COMPLETED_GOAL : 0);
			const reward = justCompleted ? completionReward(target.goalTerm) : 0;
			return {
				goals,
				crystals:       state.crystals + reward,
				celebrationFor: justCompleted ? id : state.celebrationFor,
				lastReward:     justCompleted ? reward : state.lastReward,
				...grantXp(state, xp)
			};
		}),

		freezeDay: (id: string, date: string) => set((state) => {
			if (state.freezesLeft <= 0) return {};
			const target = state.goals.find(g => g.id === id);
			if (!target || target.frozenDays.includes(date) || target.completedDays.includes(date)) return {};

			const goals = state.goals.map(g =>
				g.id === id ? {...g, frozenDays: [...g.frozenDays, date]} : g
			);
			return {goals, freezesLeft: state.freezesLeft - 1};
		}),

		updateGoal: (id: string, patch: GoalPatch) => set((state) => ({
			goals: state.goals.map(g => g.id === id ? {...g, ...patch} : g)
		})),

		killGoal: (id: string) => set((state) => ({
			goals: state.goals.map(g => g.id === id ? {...g, status: 'dead'} : g)
		})),

		reviveGoal: (id: string) => {
			let didRevive = false;
			set((state) => {
				if (state.crystals < REVIVE_COST) return {};
				const target = state.goals.find(g => g.id === id);
				if (!target || target.status !== 'dead') return {};

				didRevive   = true;
				const goals = state.goals.map(g =>
					g.id === id ? {...g, status: 'alive' as const} : g
				);
				return {goals, crystals: state.crystals - REVIVE_COST};
			});
			return didRevive;
		},

		addFreezes:         (count: number)   => set((state) => ({freezesLeft: state.freezesLeft + count})),
		grantCrystals:      (amount: number)  => set((state) => ({crystals:    state.crystals + amount})),
		setViewMode:        (mode: ViewMode)  => set(() => ({viewMode: mode})),
		clearCelebration:   ()                => set(() => ({celebrationFor: null, lastReward: 0})),
		setUserName:        (name: string)    => set(() => ({userName: name.trim() || null})),
		completeOnboarding: ()                => set(() => ({onboardingCompleted: true})),
	}),
	{
		name: 'goal-store',
	}))