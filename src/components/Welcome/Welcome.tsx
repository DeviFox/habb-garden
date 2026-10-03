import './Welcome.scss';
import {useState} from 'react';
import {useGoalStore} from '../../store/goal-store.ts';
import GardenScene from '../../assets/garden-main-scene.png';

const SproutIcon = () => (
	<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M16 28V14"/>
		<path d="M16 14c-5-1-8-5-8-10 5 0 8 4 8 10Z"/>
		<path d="M16 15c5-1 8-5 8-10-5 0-8 4-8 10Z"/>
		<path d="M8 28h16" strokeOpacity="0.4"/>
	</svg>
);

function Welcome() {
	const setUserName = useGoalStore(s => s.setUserName);
	const [name, setName] = useState('');
	const [error, setError] = useState<string | null>(null);

	function submit(e?: React.FormEvent) {
		e?.preventDefault();
		const trimmed = name.trim();
		if (trimmed.length === 0) {
			setError('Как к тебе обращаться в саду?');
			return;
		}
		if (trimmed.length > 24) {
			setError('Слишком длинное имя — пусть будет короче.');
			return;
		}
		setUserName(trimmed);
	}

	return (
		<div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
			<img className="welcome__scene" src={GardenScene} alt="" aria-hidden/>
			<div className="welcome__veil" aria-hidden/>

			<div className="welcome__card">
				<div className="welcome__mark" aria-hidden>
					<SproutIcon/>
				</div>
				<div className="welcome__kicker">Добро пожаловать в сад</div>
				<h1 id="welcome-title" className="welcome__title">
					Bloom
				</h1>
				<p className="welcome__blurb">
					Это сад, где растут твои привычки. Каждый цветок — обещание, которое ты даёшь себе каждый день.
				</p>

				<form className="welcome__form" onSubmit={submit} noValidate>
					<label className="welcome__field">
						<span className="welcome__field-label">Как к тебе обращаться?</span>
						<input
							type="text"
							className="welcome__input"
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								if (error) setError(null);
							}}
							maxLength={28}
							autoFocus
							autoComplete="given-name"
							placeholder="Имя"
							aria-invalid={!!error}
							aria-describedby={error ? 'welcome-error' : undefined}
						/>
					</label>
					{error && <div id="welcome-error" className="welcome__error" role="alert">{error}</div>}

					<button
						type="submit"
						className="welcome__submit"
						disabled={name.trim().length === 0}
					>
						В сад
					</button>
				</form>

				<div className="welcome__hint">
					Пока никаких регистраций. Прогресс хранится только у тебя на устройстве. Но я работаю над улучшением
				</div>
			</div>
		</div>
	);
}

export default Welcome;
