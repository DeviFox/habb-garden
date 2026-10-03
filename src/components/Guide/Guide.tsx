import './Guide.scss';
import {useEffect, useState} from 'react';
import {useGoalStore} from '../../store/goal-store.ts';

type GuideProps = {
	/** Standalone = opened from /guide route; closes on "Готово" via onClose.
	 *  First-run = auto-launched after name entry; completes onboarding on finish. */
	mode:    'first-run' | 'standalone';
	onClose: () => void;
}

type Slide = {
	kicker: string;
	title:  string;
	body:   string;
	icon:   () => React.JSX.Element;
}

const SeedIcon = () => (
	<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M24 44V24"/>
		<path d="M24 24c-8-2-13-8-13-16 8 0 13 7 13 16Z"/>
		<path d="M24 25c8-2 13-8 13-16-8 0-13 7-13 16Z"/>
		<path d="M14 44h20" strokeOpacity="0.35"/>
	</svg>
);

const DropIcon = () => (
	<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M24 7C16.5 16 11 23 11 29a13 13 0 0 0 26 0c0-6-5.5-13-13-22Z"/>
		<path d="M18.5 30a5.5 5.5 0 0 0 4 5" strokeOpacity="0.6"/>
	</svg>
);

const AlertIcon = () => (
	<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M24 10v18"/>
		<circle cx="24" cy="36" r="1.6" fill="currentColor" stroke="none"/>
		<path d="M24 6l20 36H4L24 6Z"/>
	</svg>
);

const HeartIcon = () => (
	<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M24 40c-10-6-16-13-16-21a9 9 0 0 1 16-5 9 9 0 0 1 16 5c0 8-6 15-16 21Z"/>
	</svg>
);

const SLIDES: Slide[] = [
	{
		kicker: 'Создавай',
		title:  'Посади цель',
		body:   'Выбери свой цветок и срок, за который хочешь достигнуть цели. Один цветок — одна привычка.',
		icon:   SeedIcon,
	},
	{
		kicker: 'Поливай',
		title:  'Отмечай каждый день',
		body:   'Заходи каждый день в сад и поливай цветок, приближая себя к цели.',
		icon:   DropIcon,
	},
	{
		kicker: 'Береги',
		title:  'Не пропускай',
		body:   'Пропущенный день ухудшает состояние цветка. Если сегодня не получилось, замораживай день — заморозка защитит цветок от увядания.',
		icon:   AlertIcon,
	},
	{
		kicker: 'Расти',
		title:  'Собирай расцветшие',
		body:   'Доведённая до конца цель расцветает и цветок остаётся в саду навсегда. Увядшим даётся второй шанс, они ждут возрождения на кладбище.',
		icon:   HeartIcon,
	},
];

function Guide({mode, onClose}: GuideProps) {
	const [index, setIndex] = useState(0);
	const completeOnboarding = useGoalStore(s => s.completeOnboarding);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && mode === 'standalone') onClose();
			if (e.key === 'ArrowLeft'  && index > 0)                 setIndex(i => i - 1);
			if (e.key === 'ArrowRight' && index < SLIDES.length - 1) setIndex(i => i + 1);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [index, mode, onClose]);

	function next() {
		if (index < SLIDES.length - 1) {
			setIndex(index + 1);
		} else {
			finish();
		}
	}

	function finish() {
		if (mode === 'first-run') completeOnboarding();
		onClose();
	}

	function skip() {
		finish();
	}

	const isLast   = index === SLIDES.length - 1;

	return (
		<div className={`guide guide--${mode}`} role="dialog" aria-modal="true" aria-labelledby="guide-title">
			{mode === 'first-run' && <div className="guide__veil" aria-hidden/>}

			<div className="guide__frame">
				{mode === 'standalone' &&
					<button type="button" className="guide__close" onClick={onClose} aria-label="Закрыть">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
							<path d="M6 6l12 12M18 6L6 18"/>
						</svg>
					</button>
				}

				<div className="guide__stage">
					{SLIDES.map((s, i) => {
						const S = s.icon;
						return (
							<article
								key={i}
								className={`guide__slide${i === index ? ' guide__slide--active' : ''}`}
								aria-hidden={i !== index}
							>
								<div className={`guide__icon guide__icon--${['seed','drop','alert','heart'][i]}`} aria-hidden>
									<S/>
								</div>
								<div className="guide__kicker">{s.kicker}</div>
								<h2 id={i === index ? 'guide-title' : undefined} className="guide__title">{s.title}</h2>
								<p className="guide__body">{s.body}</p>
							</article>
						);
					})}
				</div>

				<div className="guide__dots" role="tablist" aria-label="Шаг инструктажа">
					{SLIDES.map((_, i) => (
						<button
							key={i}
							type="button"
							role="tab"
							aria-selected={i === index}
							className={`guide__dot${i === index ? ' guide__dot--active' : ''}`}
							onClick={() => setIndex(i)}
							aria-label={`Шаг ${i + 1} из ${SLIDES.length}`}
						/>
					))}
				</div>

				<div className="guide__actions">
					<div className="guide__actions-left">
						{!isLast && mode === 'first-run' &&
							<button type="button" className="guide__skip" onClick={skip}>Пропустить</button>
						}
						{index > 0 &&
							<button type="button" className="guide__back" onClick={() => setIndex(index - 1)}>
								Назад
							</button>
						}
					</div>
					<button type="button" className="guide__next" onClick={next}>
						{isLast
							? (mode === 'first-run' ? 'В сад' : 'Понятно')
							: 'Дальше'}
					</button>
				</div>
			</div>
		</div>
	);
}

export default Guide;
