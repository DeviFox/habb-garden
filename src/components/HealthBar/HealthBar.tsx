import './HealthBar.scss';

function HealthBar({currentHealth, maxHealth}: { currentHealth: number, maxHealth: number }) {


	return (
		<>
			<div className='health-bar'>
				<div className='health-bar__sections'>
					{Array.from({length: maxHealth}, (_, i) =>
						<div key={i} className={`health-bar__section ${i < currentHealth ? 'health-bar__section--active' : ''}`}></div>)}
				</div>
			</div>
		</>
	)
}


export default HealthBar;