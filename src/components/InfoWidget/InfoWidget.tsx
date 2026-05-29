import "./InfoWidget.scss";
import GoalCard from "../GoalCard/GoalCard.tsx";

function InfoWidget() {
	const items = [{
		id: '21e23rf',
		title: 'Пописять',
	}]
	return (
		<>
			<div className="info-widget bg-white/50 w-auto h-2/4 rounded-xl">
				<div className="info-widget__header text-amber-50 text-xl p-8"> Доброе утро, Формошлёп! ☀️ </div>
				<div className="info-widget__cards" >
					<GoalCard />
				</div>
			</div>
		</>
	)
}

export default InfoWidget;