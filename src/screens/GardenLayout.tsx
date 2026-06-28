import InfoWidget from '../components/InfoWidget/InfoWidget.tsx';
import GoalCreate from '../components/GoalCreate/GoalCreate.tsx';
import {useState} from 'react';

function GardenLayout() {

	const [isGoalCreateOpen, setIsGoalCreateOpen] = useState(false);

	return (
		<>
			<div className="garden-layout flex-1 min-w-0 h-full pl-4">
				<InfoWidget onAddClick={() => setIsGoalCreateOpen(true)} />
				{isGoalCreateOpen && <GoalCreate onButtonClick={() => setIsGoalCreateOpen(false)} />}

			</div>
		</>
	)
}

export default GardenLayout;