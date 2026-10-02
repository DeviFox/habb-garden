import './Dashboard.scss';
import {useGoalStore} from '../../store/goal-store.ts';
import {calcMaxHealth, getMissedDays} from '../../utils/plantsHealth.ts';
import {calcGoalStreak, calcMaxStreak} from '../../utils/streak.ts';
import getWordDays from '../../utils/dateForms.ts';
import {PlantsMatcher} from '../../utils/PlantsMatcher.ts';
import {useMemo, useState} from 'react';
import type {Goal} from '../../types/goal.ts';

const MONTHS_RU   = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
	'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

function calcHealthPercent(goal: Goal): number {
	const maxHp = calcMaxHealth(goal);
	if (!Number.isFinite(maxHp) || maxHp <= 0) return 0;
	const missed  = getMissedDays(goal).length;
	const current = Math.max(0, maxHp - missed);
	const pct     = Math.round((current / maxHp) * 100);
	return Number.isFinite(pct) ? pct : 0;
}

function buildMonthMatrix(year: number, month: number): (number | null)[][] {
	const first                    = new Date(year, month, 1);
	const last                     = new Date(year, month + 1, 0);
	const weekday                  = (first.getDay() + 6) % 7;    // Pn-first
	const cells: (number | null)[] = [];
	for (let i = 0; i < weekday; i++) cells.push(null);
	for (let d = 1; d <= last.getDate(); d++) cells.push(d);
	while (cells.length % 7 !== 0) cells.push(null);
	const rows: (number | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
	return rows;
}

type DayStatus = 'completed' | 'frozen' | 'missed' | 'today' | 'future';

type DayAggregate = {
	iso:       string;
	status:    DayStatus;
	completed: Goal[];
	frozen:    Goal[];
	missed:    Goal[];
	activeOn:  number;
}

function aggregateDay(goals: Goal[], year: number, month: number, day: number): DayAggregate {
	const iso        = new Date(year, month, day).toISOString().slice(0, 10);
	const today      = todayISO();
	const todayDate  = new Date(today);
	const d          = new Date(iso);
	const completed: Goal[] = [];
	const frozen:    Goal[] = [];
	const missed:    Goal[] = [];
	let activeOn    = 0;

	for (const g of goals) {
		const start = new Date(g.createdAt);
		if (!Number.isFinite(start.getTime())) continue;
		if (d < start) continue;
		activeOn++;
		if      (g.completedDays.includes(iso)) completed.push(g);
		else if (g.frozenDays.includes(iso))    frozen.push(g);
		else if (d < todayDate)                 missed.push(g);
	}

	let status: DayStatus;
	if      (iso === today)        status = 'today';
	else if (completed.length > 0) status = 'completed';
	else if (frozen.length > 0)    status = 'frozen';
	else if (missed.length > 0)    status = 'missed';
	else                           status = 'future';

	return {iso, status, completed, frozen, missed, activeOn};
}

type EventEntry = {
	kind:  'completed' | 'dead' | 'frozen' | 'born';
	goal:  Goal;
	iso:   string;
	label: string;
};

function recentEvents(goals: Goal[], limit = 4): EventEntry[] {
	const events: EventEntry[] = [];
	for (const g of goals) {
		g.completedDays.slice(-2).forEach(iso => events.push({kind: 'completed', goal: g, iso, label: `Цель «${g.name}» выполнена`}));
		g.frozenDays.slice(-1).forEach(iso    => events.push({kind: 'frozen',    goal: g, iso, label: `Заморозка «${g.name}» активирована`}));
		if (g.status === 'dead') events.push({kind: 'dead', goal: g, iso: g.createdAt, label: `Цель «${g.name}» засохла`});
		events.push({kind: 'born', goal: g, iso: g.createdAt, label: `Цель «${g.name}» посажена`});
	}
	return events
		.sort((a, b) => (a.iso < b.iso ? 1 : -1))
		.slice(0, limit);
}

const CrystalGlyph = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 3L4 10l8 11 8-11-8-7Z"/>
		<path d="M4 10h16" strokeOpacity="0.7"/>
	</svg>
);

const DropGlyph = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 4C8.5 8.5 6 11.8 6 14.5a6 6 0 0 0 12 0c0-2.7-2.5-6-6-10.5Z"/>
	</svg>
);

const SnowflakeGlyph = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<line x1="12" y1="4"    x2="12" y2="20"/>
		<line x1="5.07" y1="8"  x2="18.93" y2="16"/>
		<line x1="5.07" y1="16" x2="18.93" y2="8"/>
	</svg>
);

const CheckGlyph = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M5 13l4 4L19 7"/>
	</svg>
);

function Dashboard() {
	const goals        = useGoalStore(s => s.goals);
	const freezesLeft  = useGoalStore(s => s.freezesLeft);
	const reviveGoal   = useGoalStore(s => s.reviveGoal);
	const crystals     = useGoalStore(s => s.crystals);
	const completeDay  = useGoalStore(s => s.completeDay);
	const freezeDay    = useGoalStore(s => s.freezeDay);

	const alive        = goals.filter(g => g.status === 'alive');
	const dead         = goals.filter(g => g.status === 'dead');
	const completed    = goals.filter(g => g.status === 'completed');
	const streakGlobal = calcMaxStreak(goals);
	const matcher      = useMemo(() => new PlantsMatcher(), []);

	const today       = new Date();
	const todayY      = today.getFullYear();
	const todayM      = today.getMonth();
	const todayISOStr = todayISO();

	const [viewYear,  setViewYear]  = useState(todayY);
	const [viewMonth, setViewMonth] = useState(todayM);
	const [openDay,   setOpenDay]   = useState<string | null>(null);

	const monthMatrix = useMemo(() => buildMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);
	const canGoForward = (viewYear < todayY) || (viewYear === todayY && viewMonth < todayM);

	const stepMonth = (delta: 1 | -1) => {
		let y = viewYear;
		let m = viewMonth + delta;
		if (m < 0)   { m = 11; y--; }
		if (m > 11)  { m = 0;  y++; }
		if (delta === 1 && (y > todayY || (y === todayY && m > todayM))) return;
		setViewYear(y);
		setViewMonth(m);
		setOpenDay(null);
	};

	const events = useMemo(() => recentEvents(goals), [goals]);

	/* "Средняя серия" — average streak across alive goals that actually have
	   motion (streak > 0). Goals waiting on day 0 don't drag the average
	   down anymore — "средняя серия 1 день" when only one goal has 1 day
	   is more honest than "0 дней" blended from a bunch of fresh plantings. */
	const streaksWithMotion = alive
		.filter(g => Number.isFinite(g.goalTerm) && g.goalTerm > 0)
		.map(g => calcGoalStreak(g))
		.filter(s => s > 0);
	const avgStreak = streaksWithMotion.length
		? Math.round(streaksWithMotion.reduce((a, b) => a + b, 0) / streaksWithMotion.length)
		: 0;

	const streakBarMax = Math.max(streakGlobal, 7);
	const avgStreakPct = streakBarMax > 0 ? Math.min(100, Math.round(avgStreak / streakBarMax * 100)) : 0;

	/* --- Today list: sort unresolved first, done at bottom. --- */
	const todayList = useMemo(() => {
		return [...alive].sort((a, b) => {
			const aDone = a.completedDays.includes(todayISOStr) || a.frozenDays.includes(todayISOStr) ? 1 : 0;
			const bDone = b.completedDays.includes(todayISOStr) || b.frozenDays.includes(todayISOStr) ? 1 : 0;
			return aDone - bDone;
		});
	}, [alive, todayISOStr]);

	const pendingToday = todayList.filter(g =>
		!g.completedDays.includes(todayISOStr) && !g.frozenDays.includes(todayISOStr)
	).length;

	const latestWithered = dead[dead.length - 1] ?? null;
	const olderWithered  = dead.slice(0, -1).slice(-2);

	return (
		<div className="dashboard">
			{/* --- stats --- */}
			<section className="dashboard__card dashboard__card--stats" aria-label="Статистика">
				<header className="dashboard__card-head">
					<h3 className="dashboard__card-title">Статистика</h3>
				</header>
				<div className="dashboard__mini-stats">
					<div className="dashboard__mini-stat">
						<div className="dashboard__mini-stat-value">{streakGlobal}</div>
						<div className="dashboard__mini-stat-label">дней подряд</div>
					</div>
					<div className="dashboard__mini-stat">
						<div className="dashboard__mini-stat-value">{completed.length}</div>
						<div className="dashboard__mini-stat-label">целей завершено</div>
					</div>
					<div className="dashboard__mini-stat">
						<div className="dashboard__mini-stat-value">{freezesLeft}</div>
						<div className="dashboard__mini-stat-label">заморозки осталось</div>
					</div>
				</div>
				<details className="dashboard__progress-details">
					<summary className="dashboard__progress-summary">
						<span>Подробнее</span>
						<svg className="dashboard__progress-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M6 9l6 6 6-6"/>
						</svg>
					</summary>
					<div className="dashboard__progress">
						<div className="dashboard__progress-head">
							<span>Выполнено целей</span>
							<span>{completed.length} / {goals.length || 0}</span>
						</div>
						<div className="dashboard__progress-bar">
							<div className="dashboard__progress-fill" style={{width: `${goals.length ? completed.length / goals.length * 100 : 0}%`}}/>
						</div>
						<div className="dashboard__progress-head">
							<span>Средняя серия</span>
							<span>{avgStreak} {getWordDays(avgStreak)}</span>
						</div>
						<div className="dashboard__progress-bar">
							<div className="dashboard__progress-fill" style={{width: `${avgStreakPct}%`}}/>
						</div>
					</div>
				</details>
			</section>

			{/* --- today list --- */}
			<section className="dashboard__card dashboard__card--today" aria-label="Сегодня в саду">
				<header className="dashboard__card-head">
					<h3 className="dashboard__card-title">Сегодня в саду</h3>
					<div className="dashboard__today-sub">
						{alive.length === 0
							? 'Пока в саду ничего не растёт.'
							: pendingToday === 0
								? `Весь сад полит сегодня — ${alive.length} ${getWordDays(alive.length)} в тонусе.`
								: `${pendingToday} из ${alive.length} ждут полива`}
					</div>
				</header>
				{alive.length === 0
					? <div className="dashboard__today-empty">Посадите первый цветок, и он появится здесь каждое утро.</div>
					: <ul className="dashboard__today-list">
						{todayList.map(g => {
							const done   = g.completedDays.includes(todayISOStr);
							const frozen = g.frozenDays.includes(todayISOStr);
							const src    = matcher.matchPlant(g.flowerType, matcher.matchPlantHp(5));
							const state  = done ? 'done' : frozen ? 'frozen' : 'pending';
							return (
								<li key={g.id} className={`dashboard__today-item dashboard__today-item--${state}`}>
									<span className="dashboard__today-plant" aria-hidden>
										{src
											? <img src={src} alt=""/>
											: <span className="dashboard__today-plant-ph"/>
										}
									</span>
									<div className="dashboard__today-body">
										<div className="dashboard__today-name">{g.name}</div>
										<div className="dashboard__today-meta">
											{done   && 'Полито сегодня'}
											{frozen && 'Заморожено сегодня'}
											{state === 'pending' && `${g.completedDays.length} / ${g.goalTerm} дней`}
										</div>
									</div>
									{state === 'pending'
										? <div className="dashboard__today-actions">
											<button
												type="button"
												className="dashboard__today-btn dashboard__today-btn--primary"
												onClick={() => completeDay(g.id, todayISOStr)}
												aria-label="Полить"
											>
												<DropGlyph/>
												<span>Полить</span>
											</button>
											<button
												type="button"
												className="dashboard__today-btn dashboard__today-btn--ghost"
												onClick={() => freezeDay(g.id, todayISOStr)}
												disabled={freezesLeft <= 0}
												aria-label="Заморозить"
												title={freezesLeft <= 0 ? 'Нет свободных заморозок' : 'Заморозить день'}
											>
												<SnowflakeGlyph/>
											</button>
										</div>
										: <span className="dashboard__today-check" aria-hidden>
											{done   ? <CheckGlyph/> : <SnowflakeGlyph/>}
										</span>
									}
								</li>
							);
						})}
					</ul>
				}
			</section>

			{/* --- calendar --- */}
			<section className="dashboard__card dashboard__card--calendar" aria-label="Календарь привычек">
				<header className="dashboard__card-head dashboard__card-head--with-nav">
					<h3 className="dashboard__card-title">Календарь привычек</h3>
					<div className="dashboard__calendar-nav" role="group" aria-label="Переключение месяца">
						<button type="button" className="dashboard__calendar-step" onClick={() => stepMonth(-1)} aria-label="Предыдущий месяц">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
						</button>
						<div className="dashboard__calendar-month">{MONTHS_RU[viewMonth]} {viewYear}</div>
						<button type="button" className="dashboard__calendar-step" onClick={() => stepMonth(1)} disabled={!canGoForward} aria-label="Следующий месяц">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
						</button>
					</div>
				</header>
				<div className="dashboard__calendar">
					<div className="dashboard__calendar-row dashboard__calendar-row--weekdays">
						{WEEKDAYS_RU.map(wd => <div className="dashboard__calendar-wd" key={wd}>{wd}</div>)}
					</div>
					{monthMatrix.map((row, i) => (
						<div className="dashboard__calendar-row" key={i}>
							{row.map((d, j) => {
								if (d === null) return <div className="dashboard__calendar-cell dashboard__calendar-cell--empty" key={j}/>;
								const agg = aggregateDay(goals, viewYear, viewMonth, d);
								const isOpen = openDay === agg.iso;
								const interactable = agg.status !== 'future';
								return (
									<button
										type="button"
										key={j}
										className={`dashboard__calendar-cell dashboard__calendar-cell--${agg.status}${isOpen ? ' dashboard__calendar-cell--open' : ''}`}
										onClick={() => interactable && setOpenDay(isOpen ? null : agg.iso)}
										disabled={!interactable}
										aria-pressed={isOpen}
										aria-label={`${d} ${MONTHS_RU[viewMonth]}: ${agg.completed.length} выполнено, ${agg.frozen.length} заморожено, ${agg.missed.length} пропущено`}
									>
										<span className="dashboard__calendar-num">{d}</span>
										{agg.completed.length > 0 &&
											<span className="dashboard__calendar-pips" aria-hidden>
												{Array.from({length: Math.min(3, agg.completed.length)}).map((_, k) =>
													<span className="dashboard__calendar-pip" key={k}/>
												)}
												{agg.completed.length > 3 &&
													<span className="dashboard__calendar-pip-more">+{agg.completed.length - 3}</span>
												}
											</span>
										}
									</button>
								);
							})}
						</div>
					))}
				</div>
				<div className="dashboard__calendar-legend">
					<span className="dashboard__legend dashboard__legend--completed">Выполнено</span>
					<span className="dashboard__legend dashboard__legend--frozen">Заморозка</span>
					<span className="dashboard__legend dashboard__legend--missed">Пропуск</span>
				</div>
				{openDay && (() => {
					const [yy, mm, dd] = openDay.split('-').map(Number);
					const agg = aggregateDay(goals, yy, mm - 1, dd);
					return (
						<div className="dashboard__calendar-popover" role="status">
							<div className="dashboard__calendar-popover-head">
								<span>{dd} {MONTHS_RU[mm - 1]}</span>
								<button type="button" className="dashboard__calendar-popover-close" onClick={() => setOpenDay(null)} aria-label="Закрыть">×</button>
							</div>
							<ul className="dashboard__calendar-popover-list">
								{agg.completed.map(g => <li key={`c-${g.id}`} className="dashboard__calendar-popover-item dashboard__calendar-popover-item--c">✓ {g.name}</li>)}
								{agg.frozen.map(g    => <li key={`f-${g.id}`} className="dashboard__calendar-popover-item dashboard__calendar-popover-item--f">❄ {g.name}</li>)}
								{agg.missed.map(g    => <li key={`m-${g.id}`} className="dashboard__calendar-popover-item dashboard__calendar-popover-item--m">— {g.name}</li>)}
								{agg.completed.length + agg.frozen.length + agg.missed.length === 0 &&
									<li className="dashboard__calendar-popover-empty">В этот день ещё ничего не росло.</li>
								}
							</ul>
						</div>
					);
				})()}
			</section>

			{/* --- health list --- */}
			<section className="dashboard__card dashboard__card--health" aria-label="Здоровье растений">
				<header className="dashboard__card-head">
					<h3 className="dashboard__card-title">Здоровье растений</h3>
					<div className="dashboard__health-sub">Если часто пропускать — здоровье будет снижаться.</div>
				</header>
				{alive.length === 0
					? <div className="dashboard__health-empty">Нет живых целей.</div>
					: <ul className="dashboard__health-list">
						{alive.slice(0, 6).map(g => {
							const pct = calcHealthPercent(g);
							const tone = pct >= 70 ? 'ok' : pct >= 40 ? 'warn' : 'low';
							return (
								<li className="dashboard__health-row" key={g.id}>
									<span className="dashboard__health-name">{g.name}</span>
									<span className={`dashboard__health-value dashboard__health-value--${tone}`}>{pct}%</span>
									<span className="dashboard__health-bar">
										<span className={`dashboard__health-fill dashboard__health-fill--${tone}`} style={{width: `${pct}%`}}/>
									</span>
								</li>
							);
						})}
					</ul>
				}
			</section>

			{/* --- recent events --- */}
			<section className="dashboard__card dashboard__card--events" aria-label="Недавние события">
				<header className="dashboard__card-head">
					<h3 className="dashboard__card-title">Недавние события</h3>
				</header>
				<ul className="dashboard__events">
					{events.length === 0 && <li className="dashboard__events-empty">Пока нет событий</li>}
					{events.map((e, i) => (
						<li className={`dashboard__event dashboard__event--${e.kind}`} key={i}>
							<span className="dashboard__event-dot" aria-hidden/>
							<div className="dashboard__event-body">
								<div className="dashboard__event-label">{e.label}</div>
								<div className="dashboard__event-meta">{e.iso}</div>
							</div>
						</li>
					))}
				</ul>
			</section>

			{/* --- cemetery (now hosts the "latest withered" showcase too) --- */}
			<section className="dashboard__card dashboard__card--cemetery" aria-label="Кладбище">
				<header className="dashboard__card-head">
					<h3 className="dashboard__card-title">Кладбище</h3>
					<div className="dashboard__cemetery-sub">
						{dead.length === 0 ? 'Сад полон жизни.' : 'Здесь покоятся цели, которые не удалось сохранить.'}
					</div>
				</header>
				{dead.length === 0
					? <div className="dashboard__cemetery-empty">Пока никто не покинул сад.</div>
					: <div className="dashboard__cemetery-body">
						{latestWithered && (
							<div className="dashboard__cemetery-feature">
								<div className="dashboard__cemetery-feature-plant" aria-hidden>
									{matcher.matchPlant(latestWithered.flowerType, 5)
										? <img src={matcher.matchPlant(latestWithered.flowerType, 5)!} alt=""/>
										: <span className="dashboard__cemetery-feature-ph"/>
									}
								</div>
								<div className="dashboard__cemetery-feature-body">
									<div className="dashboard__cemetery-feature-tag">Цветок засох</div>
									<div className="dashboard__cemetery-feature-name">{latestWithered.name}</div>
									{latestWithered.description &&
										<p className="dashboard__cemetery-feature-epitaph">«{latestWithered.description}»</p>
									}
									<button
										type="button"
										className="dashboard__cemetery-feature-btn"
										onClick={() => reviveGoal(latestWithered.id)}
										disabled={crystals < 50}
									>
										Возродить <span className="dashboard__cemetery-cost"><CrystalGlyph/> 50</span>
									</button>
								</div>
							</div>
						)}
						{olderWithered.length > 0 && (
							<div className="dashboard__cemetery-row">
								{olderWithered.map(g => {
									const src = matcher.matchPlant(g.flowerType, 5);
									return (
										<div className="dashboard__cemetery-mini" key={g.id}>
											<div className="dashboard__cemetery-mini-plant" aria-hidden>
												{src
													? <img src={src} alt="" style={{filter: 'grayscale(0.9) brightness(0.8)'}}/>
													: <span className="dashboard__cemetery-mini-ph"/>
												}
											</div>
											<div className="dashboard__cemetery-mini-name">{g.name}</div>
											<button
												type="button"
												className="dashboard__cemetery-mini-btn"
												onClick={() => reviveGoal(g.id)}
												disabled={crystals < 50}
											>
												<CrystalGlyph/>
												<span>50</span>
											</button>
										</div>
									);
								})}
							</div>
						)}
					</div>
				}
			</section>
		</div>
	);
}

export default Dashboard;
