import './Celebration.scss';
import {useEffect, useMemo} from 'react';
import {useGoalStore} from '../../store/goal-store.ts';
import {PlantsMatcher} from '../../utils/PlantsMatcher.ts';

const CrystalGlyph = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 3L4 10l8 11 8-11-8-7Z"/>
		<path d="M4 10h16" strokeOpacity="0.7"/>
	</svg>
);

/* 24 confetti chips, static positions / colors / rotations — procedurally
   generated so the layout is varied but deterministic across renders. */
const CONFETTI = Array.from({length: 24}, (_, i) => {
	const seed    = (i * 2654435761) >>> 0;
	const x       = (seed % 100);
	const y       = ((seed >> 8) % 100);
	const r       = ((seed >> 16) % 360);
	const d       = ((seed >> 24) % 8) * 0.1;
	const palette = ['#3c6f3b', '#c7823a', '#4b8aa6', '#e8a5b8', '#e3b84d'];
	const c       = palette[i % palette.length];
	return {x, y, r, d, c};
});

function Celebration() {
	const celebrationFor = useGoalStore(s => s.celebrationFor);
	const lastReward     = useGoalStore(s => s.lastReward);
	const clear          = useGoalStore(s => s.clearCelebration);
	const goal           = useGoalStore(s => {
		if (!celebrationFor) return null;
		return s.goals.find(g => g.id === celebrationFor) ?? null;
	});

	const matcher = useMemo(() => new PlantsMatcher(), []);

	useEffect(() => {
		if (!goal) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				clear();
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [goal, clear]);

	if (!goal) return null;

	/* Bloomed sprite = health 5 → matchPlantHp maps to stage 1 in this project's convention. */
	const sprite = matcher.matchPlant(goal.flowerType, 1);

	return (
		<div className="celebration" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
			<div className="celebration__backdrop"/>
			<div className="celebration__confetti" aria-hidden>
				{CONFETTI.map((c, i) => (
					<span
						key={i}
						className="celebration__chip"
						style={{
							left:           `${c.x}%`,
							top:            `${c.y}%`,
							transform:      `rotate(${c.r}deg)`,
							background:     c.c,
							animationDelay: `${c.d}s`,
						}}
					/>
				))}
			</div>

			<div className="celebration__card">
				<div className="celebration__kicker">Отличная работа!</div>
				<h1 id="celebration-title" className="celebration__title">
					«{goal.name}» расцвёл
				</h1>
				<div className="celebration__plant">
					{sprite
						? <img src={sprite} alt=""/>
						: <div className="celebration__plant-ph" aria-hidden/>
					}
				</div>
				<p className="celebration__blurb">
					{goal.goalTerm} {goal.goalTerm === 1 ? 'день' : goal.goalTerm < 5 ? 'дня' : 'дней'} заботы — и цветок встретил своё цветение. Ты сделал это.
				</p>
				{lastReward > 0 &&
					<div className="celebration__reward" aria-label={`Награда: ${lastReward} кристаллов`}>
						<CrystalGlyph/>
						<span>+{lastReward} кристаллов</span>
					</div>
				}
				<button type="button" className="celebration__btn" onClick={clear} autoFocus>
					Продолжить
				</button>
			</div>
		</div>
	);
}

export default Celebration;
