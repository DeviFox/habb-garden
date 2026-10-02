import './SideMenu.scss';
import flowerImg from '../../assets/flower.png';
import {NavLink} from 'react-router-dom';
import {useGoalStore} from '../../store/goal-store.ts';

const SproutIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M12 20V10"/>
		<path d="M12 10c-3-1-5-3-5-6 3 0 5 2 5 6Z"/>
		<path d="M12 11c3-1 5-3 5-6-3 0-5 2-5 6Z"/>
		<path d="M5 20h14" strokeOpacity="0.5"/>
	</svg>
);

const TargetIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<circle cx="12" cy="12" r="8"/>
		<circle cx="12" cy="12" r="4"/>
		<circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
	</svg>
);

const UrnIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M7 10c0-2 2-3 5-3s5 1 5 3v6a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-6Z"/>
		<path d="M8 7h8" strokeOpacity="0.7"/>
		<path d="M12 11v4" strokeOpacity="0.5"/>
	</svg>
);

const ChartIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M4 20V8"/>
		<path d="M10 20V4"/>
		<path d="M16 20v-8"/>
		<path d="M22 20H2" strokeOpacity="0.5"/>
	</svg>
);

const BookIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/>
		<path d="M5 17a3 3 0 0 1 3-3h11" strokeOpacity="0.6"/>
	</svg>
);

const GearIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<circle cx="12" cy="12" r="3"/>
		<path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
	</svg>
);

type NavEntry = { to: string; label: string; Icon: () => React.JSX.Element; };

const NAV: NavEntry[] = [
	{to: '/',          label: 'Сад',        Icon: SproutIcon},
	{to: '/goals',     label: 'Цели',       Icon: TargetIcon},
	{to: '/cementary', label: 'Кладбище',   Icon: UrnIcon},
	{to: '/stats',     label: 'Статистика', Icon: ChartIcon},
	{to: '/guide',     label: 'Гайд',       Icon: BookIcon},
	{to: '/settings',  label: 'Настройки',  Icon: GearIcon},
];

function SideMenu() {
	const level  = useGoalStore(s => s.userLevel);
	const xp     = useGoalStore(s => s.userXp);
	const xpMax  = useGoalStore(s => s.userXpMax);
	const xpPct  = xpMax > 0 ? Math.min(100, Math.round(xp / xpMax * 100)) : 0;

	const gardener = 'Формошлёп';

	return (
		<aside className="side-menu rounded-xl bg-white/50 w-50">
			<div className="side-menu__brand">
				<img src={flowerImg} alt="" className="side-menu__brand-mark" />
				<div className="side-menu__brand-name">Мой сад</div>
			</div>

			<nav className="side-menu__nav" aria-label="Главная навигация">
				{NAV.map(({to, label, Icon}) => (
					<NavLink
						key={to}
						to={to}
						end={to === '/'}
						className={({isActive}) => `side-menu__item${isActive ? ' side-menu__item--active' : ''}`}
					>
						<span className="side-menu__item-icon"><Icon/></span>
						<span className="side-menu__item-label">{label}</span>
					</NavLink>
				))}
			</nav>

			<div className="side-menu__profile">
				<div className="side-menu__profile-avatar" aria-hidden>
					<span>{gardener.slice(0, 1).toUpperCase()}</span>
				</div>
				<div className="side-menu__profile-body">
					<div className="side-menu__profile-name">{gardener}</div>
					<div className="side-menu__profile-level">Уровень {level}</div>
					<div className="side-menu__xp" aria-label={`${xp} из ${xpMax} XP`}>
						<div className="side-menu__xp-bar">
							<div className="side-menu__xp-fill" style={{width: `${xpPct}%`}}/>
						</div>
						<div className="side-menu__xp-meta">{xp} / {xpMax} XP</div>
					</div>
				</div>
			</div>
		</aside>
	);
}

export default SideMenu;
