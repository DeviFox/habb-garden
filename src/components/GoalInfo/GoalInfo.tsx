import './GoalInfo.scss';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Goal} from '../../types/goal.ts';
import {useGoalStore} from '../../store/goal-store.ts';
import {PlantsMatcher} from '../../utils/PlantsMatcher.ts';
import {calcCurrentHealth, calcMaxHealth, getDaysToEnd, getMissedDays} from '../../utils/plantsHealth.ts';
import {calcGoalStreak} from '../../utils/streak.ts';
import getWordDays from '../../utils/dateForms.ts';

type Props = {
	goal:    Goal;
	onClose: () => void;
}

type CellState = 'completed' | 'frozen' | 'missed' | 'today' | 'future';

type DayCell = {
	date:      string;
	state:     CellState;
	dayNumber: number;
}

const MONTHS_RU  = [
	'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
	'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const WEEKDAY_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

function buildChronicle(goal: Goal): DayCell[] {
	const start   = new Date(goal.createdAt);
	const today   = todayISO();
	const todayDt = new Date(today);
	const cells: DayCell[] = [];

	for (let i = 0; i < goal.goalTerm; i++) {
		const d = new Date(start);
		d.setDate(d.getDate() + i);
		const iso = d.toISOString().slice(0, 10);

		let state: CellState;
		if      (goal.completedDays.includes(iso)) state = 'completed';
		else if (goal.frozenDays.includes(iso))    state = 'frozen';
		else if (iso === today)                    state = 'today';
		else if (d < todayDt)                      state = 'missed';
		else                                       state = 'future';

		cells.push({date: iso, state, dayNumber: i + 1});
	}

	return cells.reverse();
}

/* Short week-strip, oldest → newest left-to-right, always 7 cells.
   Does not depend on goalTerm, so it always has something to show. */
function buildWeekStrip(goal: Goal): DayCell[] {
	const cells: DayCell[] = [];
	const todayDt = new Date();
	const today   = todayISO();
	const start   = goal.createdAt ? new Date(goal.createdAt) : null;

	for (let i = 6; i >= 0; i--) {
		const d = new Date(todayDt);
		d.setDate(d.getDate() - i);
		const iso = d.toISOString().slice(0, 10);

		let state: CellState;
		if      (goal.completedDays.includes(iso)) state = 'completed';
		else if (goal.frozenDays.includes(iso))    state = 'frozen';
		else if (iso === today)                    state = 'today';
		else if (start && d < start)               state = 'future';   // before the goal was planted
		else                                       state = 'missed';

		cells.push({date: iso, state, dayNumber: 7 - i});
	}
	return cells;
}

function groupByMonth(cells: DayCell[]): { label: string; cells: DayCell[] }[] {
	const groups: { label: string; cells: DayCell[] }[] = [];
	let current: { label: string; cells: DayCell[] } | null = null;

	for (const cell of cells) {
		const d     = new Date(cell.date);
		const label = `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
		if (!current || current.label !== label) {
			current = {label, cells: []};
			groups.push(current);
		}
		current.cells.push(cell);
	}

	return groups;
}

function calcGrowthLevel(goal: Goal): number {
	if (goal.goalTerm <= 0) return 1;
	const ratio = goal.completedDays.length / goal.goalTerm;
	return Math.max(1, Math.min(5, Math.ceil(ratio * 5)));
}

function calcHealthPercent(goal: Goal): number {
	const maxHp   = calcMaxHealth(goal);
	const missed  = getMissedDays(goal).length;
	const current = Math.max(0, maxHp - missed);
	if (maxHp === 0) return 0;
	return Math.round((current / maxHp) * 100);
}

/* Icon vocabulary: single-stroke 1.5px on 24×24 viewBox, centered mass.
   Shapes drawn to equal optical weight so none visually "floats". */

const DropIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 4C8.5 8.5 6 11.8 6 14.5a6 6 0 0 0 12 0c0-2.7-2.5-6-6-10.5Z"/>
		<path d="M9 15a3 3 0 0 0 2.4 2.6" strokeOpacity="0.55"/>
	</svg>
);

const SnowflakeIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		{/* three axes, 60° apart, centered on (12,12), length 8 each side */}
		<line x1="12" y1="4"    x2="12" y2="20"/>
		<line x1="5.07" y1="8"  x2="18.93" y2="16"/>
		<line x1="5.07" y1="16" x2="18.93" y2="8"/>
		{/* six tiny arrow-tips at every axis end */}
		<polyline points="10,5.5 12,4 14,5.5"/>
		<polyline points="10,18.5 12,20 14,18.5"/>
		<polyline points="5.6,10 5.07,8 7.1,7.5"/>
		<polyline points="18.4,14 18.93,16 16.9,16.5"/>
		<polyline points="5.6,14 5.07,16 7.1,16.5"/>
		<polyline points="18.4,10 18.93,8 16.9,7.5"/>
	</svg>
);

const PencilIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		{/* pencil body on a 45° diagonal, tip at bottom-left */}
		<path d="M14 5l5 5-10 10H4v-5L14 5Z"/>
		<path d="M13 6l5 5"/>
		<path d="M4 20l5-5"  strokeOpacity="0.6"/>
	</svg>
);

const ShearsIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		{/* pruning shears — two scissored blades meeting at (12,12) */}
		<circle cx="6"  cy="7"  r="2.4"/>
		<circle cx="6"  cy="17" r="2.4"/>
		<path d="M8 8.3l12 10"/>
		<path d="M8 15.7L20 5.7"/>
	</svg>
);

const CloseIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
		<path d="M6 6l12 12M18 6L6 18"/>
	</svg>
);

const FlameIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 3c0 3.5 4 5 4 9a4 4 0 1 1-8 0c0-1.8 1-3 2-4 .3 1 1 2 2 2 0-2.5 0-4 0-7Z"/>
	</svg>
);

function GoalInfo({goal, onClose}: Props) {
	const {completeDay, freezeDay, updateGoal, killGoal} = useGoalStore();
	const {matchPlant, matchPlantHp}                     = useMemo(() => new PlantsMatcher(), []);

	const today    = todayISO();
	const marked   = goal.completedDays.includes(today);
	const frozen   = goal.frozenDays.includes(today);
	const alive    = goal.status === 'alive';

	const [mode,         setMode]         = useState<'view' | 'edit'>('view');
	const [draftName,    setDraftName]    = useState(goal.name);
	const [draftTerm,    setDraftTerm]    = useState<string>(() => {
		const start = new Date(goal.createdAt);
		start.setDate(start.getDate() + goal.goalTerm);
		return start.toISOString().slice(0, 10);
	});
	const [deleteArmed, setDeleteArmed] = useState(false);
	const disarmTimer                   = useRef<number | null>(null);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	useEffect(() => () => {
		if (disarmTimer.current) window.clearTimeout(disarmTimer.current);
	}, []);

	const chronicle = useMemo(() => buildChronicle(goal), [goal]);
	const groups    = useMemo(() => groupByMonth(chronicle), [chronicle]);
	const weekStrip = useMemo(() => buildWeekStrip(goal), [goal]);
	const health    = calcCurrentHealth(goal);
	const healthPct = calcHealthPercent(goal);
	const level     = calcGrowthLevel(goal);
	const streak    = calcGoalStreak(goal);
	const missed    = getMissedDays(goal).length;
	const daysToEnd = getDaysToEnd(goal);
	const flowerSrc = matchPlant(goal.flowerType, matchPlantHp(health));

	function armDelete() {
		setDeleteArmed(true);
		if (disarmTimer.current) window.clearTimeout(disarmTimer.current);
		disarmTimer.current = window.setTimeout(() => setDeleteArmed(false), 3000);
	}

	function handleDelete() {
		if (!deleteArmed) {
			armDelete();
			return;
		}
		killGoal(goal.id);
		if (disarmTimer.current) window.clearTimeout(disarmTimer.current);
		onClose();
	}

	function handleMark() {
		if (marked || !alive) return;
		completeDay(goal.id, today);
	}

	function handleFreeze() {
		if (marked || frozen || !alive) return;
		freezeDay(goal.id, today);
	}

	function enterEdit() {
		setDraftName(goal.name);
		const start = new Date(goal.createdAt);
		start.setDate(start.getDate() + goal.goalTerm);
		setDraftTerm(start.toISOString().slice(0, 10));
		setMode('edit');
	}

	function saveEdit() {
		const trimmedName = draftName.trim();
		if (!trimmedName) return;
		const newTermDays = Math.max(
			1,
			Math.ceil((new Date(draftTerm).getTime() - new Date(goal.createdAt).getTime()) / 86_400_000)
		);
		updateGoal(goal.id, {name: trimmedName, goalTerm: newTermDays});
		setMode('view');
	}

	const chronicleEmpty = chronicle.length === 0;

	return (
		<>
			<div
				className="goal-info__backdrop"
				onClick={onClose}
				role="presentation"
			/>
			<div
				className="goal-info"
				role="dialog"
				aria-modal="true"
				aria-labelledby="goal-info__title"
				style={{viewTransitionName: 'goal-detail'}}
			>
				<button
					type="button"
					className="goal-info__close"
					onClick={onClose}
					aria-label="Закрыть"
				>
					<CloseIcon/>
				</button>

				<section className="goal-info__hero">
					<div className="goal-info__plant">
						{flowerSrc
							? <img className="goal-info__plant-img" src={flowerSrc} alt={goal.name}/>
							: <div className="goal-info__plant-img goal-info__plant-img--placeholder" aria-hidden/>
						}
					</div>

					<div className="goal-info__identity">
						<div className="goal-info__level">
							<span className="goal-info__level-label">Уровень</span>
							<span className="goal-info__level-value">{level}</span>
							<span className="goal-info__level-sep">·</span>
							<span className="goal-info__level-label">Здоровье</span>
							<span className={`goal-info__level-value${healthPct < 40 ? ' goal-info__level-value--low' : ''}`}>
								{healthPct}%
							</span>
						</div>

						{mode === 'view'
							? <h2 id="goal-info__title" className="goal-info__name">{goal.name}</h2>
							: <input
								className="goal-info__name-input"
								value={draftName}
								onChange={(e) => setDraftName(e.target.value)}
								maxLength={60}
								autoFocus
								aria-label="Название цели"
							/>
						}

						<dl className="goal-info__stats">
							<div className="goal-info__stat">
								<dt className="goal-info__stat-label">
									{`${goal.completedDays.length} / ${goal.goalTerm}`}
								</dt>
								<dd className="goal-info__stat-meta">{getWordDays(goal.goalTerm)}</dd>
							</div>
							<div className="goal-info__stat">
								<dt className="goal-info__stat-label goal-info__stat-label--streak">
									<FlameIcon/>
									<span>{streak}</span>
								</dt>
								<dd className="goal-info__stat-meta">дней подряд</dd>
							</div>
							<div className="goal-info__stat">
								<dt className="goal-info__stat-label">{missed}</dt>
								<dd className="goal-info__stat-meta">пропусков</dd>
							</div>
						</dl>

						{alive &&
							<div className={
								'goal-info__today-pill' +
								(marked ? ' goal-info__today-pill--watered' : '') +
								(frozen ? ' goal-info__today-pill--frozen'  : '')
							}>
								<span className="goal-info__today-dot" aria-hidden/>
								<span>
									{marked      ? 'Сегодня: полито'
									: frozen     ? 'Сегодня: заморожено'
									               : 'Сегодня ждёт полива'}
								</span>
							</div>
						}

						{alive && daysToEnd > 0 &&
							<div className="goal-info__remaining">
								Осталось {daysToEnd} {getWordDays(daysToEnd)} до цветения
							</div>
						}
						{goal.status === 'completed' &&
							<div className="goal-info__remaining goal-info__remaining--bloom">
								Распустился
							</div>
						}
						{goal.status === 'dead' &&
							<div className="goal-info__remaining goal-info__remaining--dead">
								Увял
							</div>
						}

						{goal.description &&
							<p className="goal-info__description">{goal.description}</p>
						}

						{mode === 'edit' &&
							<label className="goal-info__term">
								<span className="goal-info__term-label">Срок</span>
								<input
									className="goal-info__term-input"
									type="date"
									value={draftTerm}
									onChange={(e) => setDraftTerm(e.target.value)}
								/>
							</label>
						}
					</div>
				</section>

				<section className="goal-info__chronicle" aria-label="Хроника дней">
					<div className="goal-info__chronicle-head">История</div>

					<ol className="goal-info__week" aria-label="Последние 7 дней">
						{weekStrip.map(cell => {
							const d      = new Date(cell.date);
							const wd     = WEEKDAY_RU[d.getDay()];
							const dayNum = d.getDate();
							return (
								<li
									key={cell.date}
									className={`goal-info__week-cell goal-info__week-cell--${cell.state}`}
									title={`${wd}, ${dayNum}: ${cell.state}`}
								>
									<span className="goal-info__week-weekday">{wd}</span>
									<span className="goal-info__week-glyph" aria-hidden>
										{cell.state === 'completed' && (
											<svg viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M5 10.5l3.3 3L15 6.5"/>
											</svg>
										)}
										{cell.state === 'frozen' && (
											<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
												<line x1="10" y1="3"  x2="10" y2="17"/>
												<line x1="3"  y1="10" x2="17" y2="10"/>
												<line x1="4.5" y1="4.5" x2="15.5" y2="15.5"/>
												<line x1="15.5" y1="4.5" x2="4.5" y2="15.5"/>
											</svg>
										)}
										{cell.state === 'missed' && (
											<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
												<path d="M6 6l8 8M14 6l-8 8"/>
											</svg>
										)}
										{cell.state === 'today' && (
											<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
												<path d="M10 4C8.3 7 7 8.8 7 10.6a3 3 0 0 0 6 0C13 8.8 11.7 7 10 4Z"/>
											</svg>
										)}
										{cell.state === 'future' && <span className="goal-info__week-dot"/>}
									</span>
									<span className="goal-info__week-num">{dayNum}</span>
								</li>
							);
						})}
					</ol>

					{chronicleEmpty
						? <div className="goal-info__chronicle-empty">Хроника начнёт заполняться с первой отметки.</div>
						: groups.map(group => (
							<div className="goal-info__chronicle-group" key={group.label}>
								<div className="goal-info__chronicle-label">{group.label}</div>
								<ol className="goal-info__chronicle-list">
									{group.cells.map(cell => {
										const d       = new Date(cell.date);
										const wd      = WEEKDAY_RU[d.getDay()];
										const dayNum  = d.getDate();
										const classes = [
											'goal-info__day',
											`goal-info__day--${cell.state}`,
										].join(' ');
										return (
											<li key={cell.date} className={classes}>
												<span className="goal-info__day-weekday">{wd}</span>
												<span className="goal-info__day-number">{dayNum}</span>
												<span className="goal-info__day-ordinal">{cell.dayNumber}-й</span>
												<span className="goal-info__day-mark" aria-hidden>
													{cell.state === 'completed' && (
														<svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
															<path d="M3 8.5l3.2 3L13 4.5"/>
														</svg>
													)}
													{cell.state === 'frozen' && (
														<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
															<path d="M8 2v12M2 8h12M4 4l8 8M12 4l-8 8"/>
														</svg>
													)}
												</span>
											</li>
										);
									})}
								</ol>
							</div>
						))
					}
				</section>

				<footer className="goal-info__footer">
					{mode === 'view'
						? <>
							<button
								type="button"
								className={
									'goal-info__primary' +
									(marked ? ' goal-info__primary--marked' : '') +
									(frozen && !marked ? ' goal-info__primary--frozen' : '')
								}
								onClick={handleMark}
								disabled={marked || frozen || !alive}
							>
								{frozen && !marked ? <SnowflakeIcon/> : <DropIcon/>}
								<span>
									{marked         ? 'Полито сегодня'
									 : frozen       ? 'Заморожено сегодня'
									                : 'Полить сегодня'}
								</span>
							</button>

							<button
								type="button"
								className="goal-info__sec goal-info__sec--freeze"
								onClick={handleFreeze}
								disabled={marked || frozen || !alive}
								aria-label={frozen ? 'Заморожено' : 'Заморозить день'}
								title={frozen ? 'Заморожено' : 'Заморозить день'}
							>
								<SnowflakeIcon/>
							</button>
							<button
								type="button"
								className="goal-info__sec goal-info__sec--edit"
								onClick={enterEdit}
								disabled={!alive}
								aria-label="Редактировать"
								title="Редактировать"
							>
								<PencilIcon/>
							</button>
							<button
								type="button"
								className={`goal-info__sec goal-info__sec--danger${deleteArmed ? ' goal-info__sec--armed' : ''}`}
								onClick={handleDelete}
								aria-label={deleteArmed ? 'Нажмите ещё раз, чтобы срезать' : 'Срезать'}
								title={deleteArmed ? 'Нажмите ещё раз, чтобы срезать' : 'Срезать'}
							>
								<ShearsIcon/>
							</button>
						</>
						: <>
							<button type="button" className="goal-info__primary goal-info__primary--cancel" onClick={() => setMode('view')}>
								<span>Отменить</span>
							</button>
							<button type="button" className="goal-info__primary goal-info__primary--save" onClick={saveEdit}>
								<span>Сохранить</span>
							</button>
						</>
					}
				</footer>
			</div>
		</>
	);
}

export default GoalInfo;