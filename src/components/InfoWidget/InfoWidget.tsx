import "./InfoWidget.scss";
import {useEffect, useRef, useState} from 'react';
import {useGoalStore} from '../../store/goal-store.ts';
import type {Goal} from '../../types/goal.ts';
import GoalCard from "../GoalCard/GoalCard.tsx";
import {calcMaxStreak} from '../../utils/streak.ts';

function getTimeOfDayGreeting(date: Date = new Date()): string {
	const h = date.getHours();
	if (h >= 5  && h < 12) return 'Доброе утро';
	if (h >= 12 && h < 17) return 'Добрый день';
	if (h >= 17 && h < 23) return 'Добрый вечер';
	return 'Доброй ночи';
}

const FlameIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 3c0 3.5 4 5 4 9a4 4 0 1 1-8 0c0-1.8 1-3 2-4 .3 1 1 2 2 2 0-2.5 0-4 0-7Z"/>
	</svg>
);

const SnowflakeIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<line x1="12" y1="4"    x2="12" y2="20"/>
		<line x1="5.07" y1="8"  x2="18.93" y2="16"/>
		<line x1="5.07" y1="16" x2="18.93" y2="8"/>
		<polyline points="10,5.5 12,4 14,5.5"/>
		<polyline points="10,18.5 12,20 14,18.5"/>
		<polyline points="5.6,10 5.07,8 7.1,7.5"/>
		<polyline points="18.4,14 18.93,16 16.9,16.5"/>
		<polyline points="5.6,14 5.07,16 7.1,16.5"/>
		<polyline points="18.4,10 18.93,8 16.9,7.5"/>
	</svg>
);

const CrystalIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 3L4 10l8 11 8-11-8-7Z"/>
		<path d="M4 10h16" strokeOpacity="0.7"/>
		<path d="M12 3v18"  strokeOpacity="0.5"/>
	</svg>
);

const PlusIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
		<path d="M12 5v14M5 12h14"/>
	</svg>
);

const SunIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<circle cx="12" cy="12" r="4"/>
		<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
	</svg>
);

const MoonIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>
	</svg>
);

type InfoWidgetProps = {
	onAddClick:       () => void;
	isCreateOpen:     boolean;
	onInfoOpen:       (goalId: string) => void;
	openInfoId:       string | null;
	openingTargetId:  string | null;
}

function InfoWidget({onAddClick, isCreateOpen, onInfoOpen, openInfoId, openingTargetId}: InfoWidgetProps) {

	const items: Goal[]  = useGoalStore(s => s.goals);
	const crystals       = useGoalStore(s => s.crystals);
	const freezesLeft    = useGoalStore(s => s.freezesLeft);
	const viewMode       = useGoalStore(s => s.viewMode);
	const onViewModeChange = useGoalStore(s => s.setViewMode);
	const streakGlobal   = calcMaxStreak(items);

	const greeting      = getTimeOfDayGreeting();
	const gardener      = 'Формошлёп';

	/* Track horizontal scroll of the cards row so the mask fade appears on each
	   edge only when there's actually content hidden behind it — the leftmost
	   card stays fully visible until the row is scrolled, instead of always
	   being chewed off. */
	const scrollRef                    = useRef<HTMLDivElement>(null);
	const [overflow, setOverflow]      = useState({left: false, right: false});

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const update = () => {
			setOverflow({
				left:  el.scrollLeft > 4,
				right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
			});
		};
		update();
		el.addEventListener('scroll', update, {passive: true});
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => {
			el.removeEventListener('scroll', update);
			ro.disconnect();
		};
	}, [items.length]);

	return (
		<div className={`info-widget w-auto rounded-xl${viewMode === 'night' ? ' info-widget--night' : ''}`}>
			<div className="info-widget__topbar">
				<div className="info-widget__salutation">
					<div className="info-widget__salutation-greeting">{greeting},</div>
					<div className="info-widget__salutation-name">{gardener}.</div>
					<div className="info-widget__salutation-tag">Сегодня отличный день, чтобы вырастить что-то прекрасное.</div>
				</div>

				<div className="info-widget__chips" aria-label="Статистика сада">
					<div className="info-widget__chip">
						<span className="info-widget__chip-icon info-widget__chip-icon--flame"><FlameIcon/></span>
						<span className="info-widget__chip-text">
							<span className="info-widget__chip-value">{streakGlobal}</span>
							<span className="info-widget__chip-label">дней подряд</span>
						</span>
					</div>
					<div className="info-widget__chip">
						<span className="info-widget__chip-icon info-widget__chip-icon--snow"><SnowflakeIcon/></span>
						<span className="info-widget__chip-text">
							<span className="info-widget__chip-value">{freezesLeft}</span>
							<span className="info-widget__chip-label">заморозки</span>
						</span>
					</div>
					<div className="info-widget__chip">
						<span className="info-widget__chip-icon info-widget__chip-icon--crystal"><CrystalIcon/></span>
						<span className="info-widget__chip-text">
							<span className="info-widget__chip-value">{crystals}</span>
							<span className="info-widget__chip-label">кристаллов</span>
						</span>
					</div>
				</div>

				<div className="info-widget__actions">
					<button
						type="button"
						className="info-widget__new-goal"
						onClick={onAddClick}
						disabled={isCreateOpen}
						style={{viewTransitionName: isCreateOpen ? 'none' : 'goal-create'}}
					>
						<PlusIcon/>
						<span>Новая цель</span>
					</button>

					<div className="info-widget__view-toggle" role="group" aria-label="Вид сада">
						<button
							type="button"
							className={`info-widget__view-opt${viewMode === 'day' ? ' info-widget__view-opt--active' : ''}`}
							onClick={() => onViewModeChange('day')}
							aria-pressed={viewMode === 'day'}
							aria-label="Дневной вид"
						>
							<SunIcon/>
						</button>
						<button
							type="button"
							className={`info-widget__view-opt${viewMode === 'night' ? ' info-widget__view-opt--active' : ''}`}
							onClick={() => onViewModeChange('night')}
							aria-pressed={viewMode === 'night'}
							aria-label="Ночной вид"
						>
							<MoonIcon/>
						</button>
					</div>
				</div>
			</div>

			<div className="info-widget__cards flex items-end gap-6 flex-row">
				<div
					ref={scrollRef}
					className="info-widget__cards-created flex items-center gap-6 flex-row overflow-x-auto"
					data-overflow-left={overflow.left}
					data-overflow-right={overflow.right}
				>
					{items.filter(g => g.status !== 'completed').map((item) => (
						<GoalCard
							key={item.id}
							item={item}
							onInfoOpen={onInfoOpen}
							isInfoOpen={openInfoId === item.id}
							isOpeningTarget={openingTargetId === item.id}
						/>
					))}
					{items.some(g => g.status === 'completed') && items.some(g => g.status !== 'completed') &&
						<div className="info-widget__shelf-divider" aria-hidden>
							<span className="info-widget__shelf-divider-tag">Расцвели</span>
						</div>
					}
					{items.filter(g => g.status === 'completed').map((item) => (
						<GoalCard
							key={item.id}
							item={item}
							onInfoOpen={onInfoOpen}
							isInfoOpen={openInfoId === item.id}
							isOpeningTarget={openingTargetId === item.id}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export default InfoWidget;