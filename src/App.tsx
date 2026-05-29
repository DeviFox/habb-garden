import './App.css';
import GardenLayout from './screens/GardenLayout.tsx';
import GoalsLayout from './screens/GoalsLayout.tsx';
import SideMenu from './components/SideMenu/SideMenu.tsx';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {

	return (
		<BrowserRouter>
			<div className="flex h-full">
				<SideMenu/>
				<Routes>
					<Route path="/" element={<GardenLayout/>}/>
					<Route path="/goals" element={<GoalsLayout/>}/>
					<Route path="/cementary" element={<div></div>}/>
					<Route path="/stats" element={<div></div>}/>
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App
