import InfoWidget from '../components/InfoWidget/InfoWidget.tsx';
import GoalCreate from '../components/GoalCreate/GoalCreate.tsx';
import GoalInfo from '../components/GoalInfo/GoalInfo.tsx';
import Dashboard from '../components/Dashboard/Dashboard.tsx';
import Celebration from '../components/Celebration/Celebration.tsx';
import {useState} from 'react';
import {flushSync} from 'react-dom';
import {useGoalStore} from '../store/goal-store.ts';

type DocWithTransition = Document & {
	startViewTransition?: (cb: () => void) => { finished?: Promise<void> } | unknown;
};

function GardenLayout() {

	const [isGoalCreateOpen, setIsGoalCreateOpen] = useState(false);
	const [openGoalInfoId,   setOpenGoalInfoId]   = useState<string | null>(null);
	const [openingTargetId,  setOpeningTargetId]  = useState<string | null>(null);

	const goal = useGoalStore(s => s.goals.find(g => g.id === openGoalInfoId) ?? null);

	const withTransition = (cb: () => void): Promise<void> => {
		const doc = document as DocWithTransition;
		if (!doc.startViewTransition) {
			cb();
			return Promise.resolve();
		}
		const t = doc.startViewTransition(() => flushSync(cb)) as { finished?: Promise<void> };
		return t?.finished ?? Promise.resolve();
	};

	const toggleGoalCreate = (open: boolean) => { void withTransition(() => setIsGoalCreateOpen(open)); };

	const openGoalInfo = (id: string) => {
		/* Mark the clicked card as the open-target BEFORE snapshot, so only this
		   one card has the paired view-transition-name. Other cards stay unnamed
		   and don't get promoted into the transition layer. */
		flushSync(() => setOpeningTargetId(id));
		void withTransition(() => {
			setOpenGoalInfoId(id);
			setOpeningTargetId(null);
		});
	};

	const closeGoalInfo = () => {
		const closingId = openGoalInfoId;
		if (!closingId) return;
		/* Set the target INSIDE the transition callback so the NEW snapshot has
		   the originating card named 'goal-detail' — making the modal morph
		   back into the card instead of plain-fading out. */
		void withTransition(() => {
			setOpenGoalInfoId(null);
			setOpeningTargetId(closingId);
		}).then(() => setOpeningTargetId(null));
	};

	return (
		<div className="garden-layout flex-1 min-w-0 h-full overflow-y-auto pl-4 max-[640px]:pl-0">
			<InfoWidget
				onAddClick={() => toggleGoalCreate(true)}
				isCreateOpen={isGoalCreateOpen}
				onInfoOpen={openGoalInfo}
				openInfoId={openGoalInfoId}
				openingTargetId={openingTargetId}
			/>
			<Dashboard/>
			{isGoalCreateOpen && <GoalCreate onButtonClick={() => toggleGoalCreate(false)} />}
			{goal              && <GoalInfo goal={goal} onClose={closeGoalInfo} />}
			<Celebration/>
		</div>
	)
}

export default GardenLayout;
