import './App.css';
import ConstructionLayout from './screens/ConstructionLayout.tsx';
import GardenLayout from './screens/GardenLayout.tsx';
import SideMenu from './components/SideMenu/SideMenu.tsx';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {useEffect} from 'react';
import {useGoalStore} from './store/goal-store.ts';

function App() {
	const viewMode = useGoalStore(s => s.viewMode);

	useEffect(() => {
		document.documentElement.dataset.theme = viewMode;
	}, [viewMode]);

	return (
		<BrowserRouter>
			<div className="flex h-full">
				<SideMenu/>
				<Routes>
					<Route path="/"          element={<GardenLayout/>}/>
					<Route path="/goals"     element={<ConstructionLayout/>}/>
					<Route path="/cementary" element={<ConstructionLayout/>}/>
					<Route path="/stats"     element={<ConstructionLayout/>}/>
					<Route path="/guide"     element={<ConstructionLayout/>}/>
					<Route path="/settings"  element={<ConstructionLayout/>}/>
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App
