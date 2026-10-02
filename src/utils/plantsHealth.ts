import type {Goal} from '../types/goal.ts';

export function calcMaxHealth(plant: Goal) {
	const term  = Number.isFinite(plant.goalTerm) && plant.goalTerm > 0 ? plant.goalTerm : 0;
	const maxHp = Math.max(Math.round(term * 20 / 100), 3);

	return Math.min(10, maxHp);
}

export function calcStage(plant: Goal) {
	if (plant.goalTerm === plant.completedDays.length) {
		return 'completed';
	}

	if (calcCurrentHealth(plant) === 5) {
		return 'dead';
	}

	return 'alive';
}

export function calcCurrentHealth(goal: Goal) {
	const maxHealth = calcMaxHealth(goal);
	const currentHealth = maxHealth - getMissedDays(goal).length;

	if (currentHealth / maxHealth >= 0.8) {
		return 5;
	}
	if (currentHealth / maxHealth >= 0.5) {
		return 4;
	}
	if (currentHealth / maxHealth >= 0.3) {
		return 3;
	}
	if (currentHealth / maxHealth >= 0.2) {
		return 2;
	}

	return 1;

}

export function getDaysToEnd(goal: Goal) {
	return goal.goalTerm - goal.completedDays.length;
}

export function getMissedDays(goal: Goal) {
	const today = new Date().toISOString().slice(0, 10);
	const current = new Date(goal.createdAt);
	const end = new Date(today);
	const missed = [];

	while (current < end) {
		const dateStr = current.toISOString().slice(0, 10);
		if (!goal.completedDays.includes(dateStr) && !goal.frozenDays.includes(dateStr)) {
			missed.push(dateStr);
		}
		current.setDate(current.getDate() + 1);
	}

	return missed;
}