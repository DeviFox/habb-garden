import "./InfoWidget.scss";
import {useGoalStore} from '../../store/goal-store.ts';
import type {Goal} from '../../types/goal.ts';
import GoalCard from "../GoalCard/GoalCard.tsx";


function InfoWidget({onAddClick}: { onAddClick: () => void }) {

	const items: Goal[] = useGoalStore(s => s.goals)
	// const items: Goal[] = [
	// 	{
	// 		id:            '21e23rf',
	// 		name:          'Пописять',
	// 		flowerType:    Flowers.ROSE,
	// 		frozenDays:    [],
	// 		status:        'alive',
	// 		completedDays: ['2026-07-01', '2026-07-02'],
	// 		goalTerm:      300,
	// 		createdAt:     '2026-06-30',
	// 	},
	// 	{
	// 		id:            '21e23rd',
	// 		name:          'Поприкалываться',
	// 		flowerType:    Flowers.TULIP,
	// 		frozenDays:    [],
	// 		status:        'alive',
	// 		completedDays: [],
	// 		goalTerm:      30,
	// 		createdAt:     '2026-06-21',
	// 	},
	// 	{
	// 		id:            '21e23r2',
	// 		name:          'Похыхкать',
	// 		flowerType:    Flowers.SUNFLOWER,
	// 		frozenDays:    [],
	// 		status:        'alive',
	// 		completedDays: [],
	// 		goalTerm:      30,
	// 		createdAt:     '2026-06-23',
	// 	},
	// 	{
	// 		id:            '21e23r6',
	// 		name:          'ААААА СЕКС',
	// 		flowerType:    Flowers.LAVENDER,
	// 		frozenDays:    [],
	// 		status:        'alive',
	// 		completedDays: [],
	// 		goalTerm:      3,
	// 		createdAt:     '',
	// 	},
	// ]

	return (
		<>
			<div className="info-widget bg-white/50 w-auto rounded-xl p-6">
				<div className="info-widget__header text-amber-50 text-xl p-4"> Доброе утро, Формошлёп! ☀️</div>
				<div className="info-widget__cards flex items-center justify-start gap-6 flex-row">
					{items.map((item => (
						<GoalCard
							key={item.id}
							item={item}
						/>
					)))}
					<GoalCard onAddClick={onAddClick}/>
				</div>
			</div>
		</>
	)
}

export default InfoWidget;