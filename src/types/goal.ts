import  {type Flowers} from './flowers.ts';

export interface Goal {
	/** Id of goal */
	id: string,
	/** Goal title */
	name: string,
	/** Goal description */
	description: string,
	/** Date, when flower(goal) has been created */
	createdAt: string,
	/** Completed days streak */
	completedDays: string[],
	/** Term of the goal, when it's will be completed */
	goalTerm: number,
	/** Type of the flower (Rose, tulip, etc.) */
	flowerType: Flowers,
	// /** Hitpoints of the flower */
	// hp: number,
	/** Days, when freezing used */
	frozenDays: string[],
	/** Status of the flower */
	status: 'alive' | 'completed' | 'dead',
}