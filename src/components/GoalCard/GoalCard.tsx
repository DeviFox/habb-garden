import './GoalCard.scss';
import type {Goal} from '../../types/goal.ts';
import Plus from '../../assets/plus.svg';
import {calcCurrentHealth, getMissedDays} from '../../utils/plantsHealth.ts';
import {PlantsMatcher} from '../../utils/PlantsMatcher.ts';

type GoalCard = {
	item?: Goal
	onAddClick?: () => void;
}

function GoalCard({item, onAddClick}: GoalCard) {

	if (item) {
		console.log(getMissedDays(item), 'missed Days')
	}

	const {matchPlant, matchPlantHp} = new PlantsMatcher();

	const flower = item ? matchPlant(item.flowerType, matchPlantHp(calcCurrentHealth(item))) : undefined;

	return (
		<>
			{item ?
				<div className='goal-card rounded-xl flex flex-col justify-center items-center bg-white/50 w-50'>
					<div className='goal-card__title flex items-center justify-center pt-3 text-xl gap-2'> {item.name} </div>
					<div className='goal-card__subtitle  flex items-center justify-center pt-2 text-sm gap-2'> {item.completedDays.length + ' / ' + item.goalTerm}</div>
					<img className='goal-card__img flex items-center justify-center p-6 w-50 h-52' src={flower} alt='flower'/>
					<div className='goal-card__description flex items-center justify-center text-sm gap-2'> {calcCurrentHealth(item)}</div>
				</div>
				: <div>
					<div className='goal-card_plus rounded-xl flex flex-col justify-center items-center bg-white/50 w-50'
					     onClick={onAddClick}
					>
						<div className='goal-card__title flex items-center justify-center pt-3 text-xl gap-2'></div>
						<div className='goal-card__subtitle  flex items-center justify-center pt-2 text-sm gap-2'></div>
						<img className='goal-card_plus__img flex items-center justify-center p-6'
						     src={Plus}
						     alt='flower'
						/>
						<div className='goal-card__description flex items-center justify-center text-sm gap-2'></div>
					</div>
				</div>
			}
		</>
	)
}

export default GoalCard;