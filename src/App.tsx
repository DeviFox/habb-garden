import './App.css';
import ConstructionLayout from './screens/ConstructionLayout.tsx';
import GardenLayout from './screens/GardenLayout.tsx';
import SideMenu from './components/SideMenu/SideMenu.tsx';
import Welcome from './components/Welcome/Welcome.tsx';
import Guide from './components/Guide/Guide.tsx';
import {BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {useGoalStore} from './store/goal-store.ts';

function GuideRoute() {
	const navigate = useNavigate();
	return <Guide mode="standalone" onClose={() => navigate(-1)}/>;
}

function AppShell() {
	const viewMode            = useGoalStore(s => s.viewMode);
	const userName            = useGoalStore(s => s.userName);
	const onboardingCompleted = useGoalStore(s => s.onboardingCompleted);

	const location = useLocation();
	const onGuideRoute = location.pathname === '/guide';

	/* First-run Guide: show once right after name is set.
	   Flag flips in local state so we don't reopen on every re-render; store's
	   onboardingCompleted makes it permanent across sessions. */
	const [firstRunOpen, setFirstRunOpen] = useState(false);
	useEffect(() => {
		if (userName && !onboardingCompleted) setFirstRunOpen(true);
	}, [userName, onboardingCompleted]);

	useEffect(() => {
		document.documentElement.dataset.theme = viewMode;
	}, [viewMode]);

	return (
		<>
			<div className="flex h-full">
				<SideMenu/>
				<Routes>
					<Route path="/"          element={<GardenLayout/>}/>
					<Route path="/goals"     element={<ConstructionLayout/>}/>
					<Route path="/cementary" element={<ConstructionLayout/>}/>
					<Route path="/stats"     element={<ConstructionLayout/>}/>
					<Route path="/guide"     element={<GuideRoute/>}/>
					<Route path="/settings"  element={<ConstructionLayout/>}/>
					<Route path="*"          element={<Navigate to="/" replace/>}/>
				</Routes>
			</div>

			{!userName && <Welcome/>}

			{userName && !onboardingCompleted && firstRunOpen && !onGuideRoute &&
				<Guide mode="first-run" onClose={() => setFirstRunOpen(false)}/>
			}
		</>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AppShell/>
		</BrowserRouter>
	);
}

export default App;
