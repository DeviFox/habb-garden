import './App.css';
import SideMenu from './components/SideMenu.tsx';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {

	return (
		<BrowserRouter>
			<div className="flex h-full">
				<SideMenu/>
				<Routes>
					<Route path="/" element={<div></div>}/>
					<Route path="/goals" element={<div></div>}/>
					<Route path="/cementary" element={<div></div>}/>
					<Route path="/stats" element={<div></div>}/>
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App
