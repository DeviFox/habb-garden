import type {Goal} from '../types/goal.ts';

export function calcGoalStreak(goal: Goal): number {
	const completed = new Set(goal.completedDays);
	const frozen    = new Set(goal.frozenDays);
	const d         = new Date();
	const today     = d.toISOString().slice(0, 10);

	if (!completed.has(today) && !frozen.has(today)) {
		d.setDate(d.getDate() - 1);
	}

	let streak = 0;
	for (let i = 0; i < 3650; i++) {
		const iso = d.toISOString().slice(0, 10);
		if (completed.has(iso))      streak++;
		else if (frozen.has(iso))    { /* passes through */ }
		else                         break;
		d.setDate(d.getDate() - 1);
	}
	return streak;
}

export function calcMaxStreak(goals: Goal[]): number {
	return goals
		.filter(g => g.status === 'alive')
		.reduce((max, g) => Math.max(max, calcGoalStreak(g)), 0);
}