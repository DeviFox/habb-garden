import './GoalCard.scss';
import type {KeyboardEvent} from 'react';
import type {Goal} from '../../types/goal.ts';
import Plus from '../../assets/plus.svg';
import {calcCurrentHealth, calcMaxHealth} from '../../utils/plantsHealth.ts';
import {PlantsMatcher} from '../../utils/PlantsMatcher.ts';
import HealthBar from '../HealthBar/HealthBar.tsx';

type GoalCardProps = {
	item?: Goal
	onAddClick?: () => void;
	isCreateOpen?: boolean;
	onInfoOpen?: (goalId: string) => void;
	isInfoOpen?: boolean;
	isOpeningTarget?: boolean;
}

const BloomBadgeIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
		<path d="M12 2l1.9 5.6L19.8 8l-4.7 3.4L17 17.2 12 14l-5 3.2 1.9-5.8L4.2 8l5.9-.4L12 2Z"/>
	</svg>
);

function GoalCard({item, onAddClick, isCreateOpen, onInfoOpen, isInfoOpen, isOpeningTarget}: GoalCardProps) {

	const {matchPlant, matchPlantHp} = new PlantsMatcher();

	if (!item) {
		return (
			<div>
				<div className='goal-card_plus rounded-xl flex flex-col justify-center items-center bg-white/50 w-50'
				     onClick={onAddClick}
				     style={{viewTransitionName: isCreateOpen ? 'none' : 'goal-create'}}
				>
					<img className='goal-card_plus__img flex items-center justify-center p-6'
					     src={Plus}
					     alt='flower'
					/>
				</div>
			</div>
		);
	}

	const isBloomed = item.status === 'completed';
	/* For bloomed trophies, always show the healthiest sprite — stage 1 in this project's
	   matchPlantHp convention. Alive cards still reflect current health. */
	const flower = isBloomed
		? matchPlant(item.flowerType, 1)
		: matchPlant(item.flowerType, matchPlantHp(calcCurrentHealth(item)));

	const handleOpen = () => onInfoOpen?.(item.id);
	const handleKey  = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleOpen();
		}
	};

	const className = `goal-card rounded-xl flex flex-col justify-center items-center bg-white/50${isBloomed ? ' goal-card--bloomed' : ''}`;

	return (
		<div
			className={className}
			onClick={handleOpen}
			onKeyDown={handleKey}
			role="button"
			tabIndex={0}
			aria-label={isBloomed ? `Расцветший цветок: ${item.name}` : `Открыть цель ${item.name}`}
			style={{viewTransitionName: isOpeningTarget && !isInfoOpen ? 'goal-detail' : undefined}}
		>
			{isBloomed &&
				<span className="goal-card__bloom-badge" aria-hidden>
					<BloomBadgeIcon/>
				</span>
			}
			<div className='goal-card__title flex items-center justify-center pt-3 text-xl gap-2'> {item.name} </div>
			<div className='goal-card__subtitle flex items-center justify-center pt-2 text-sm gap-2'>
				{isBloomed ? 'Расцвёл' : `${item.completedDays.length} / ${item.goalTerm}`}
			</div>
			<img className='goal-card__img p-4' src={flower} alt='flower'/>
			{!isBloomed &&
				<div className='goal-card__description flex items-center justify-center text-sm gap-2'>
					<HealthBar currentHealth={calcCurrentHealth(item)} maxHealth={calcMaxHealth(item)} />
				</div>
			}
		</div>
	)
}

export default GoalCard;
