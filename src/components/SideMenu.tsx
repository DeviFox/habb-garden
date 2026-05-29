import './SideMenu.scss';
import flowerImg from '../assets/flower.png';
import {Link} from 'react-router-dom';

function SideMenu() {
	return (
		<>
			<div className="side-menu rounded-lg bg-white/50 w-44">
				<div className="side-menu__title flex items-center justify-center p-6 text-xl gap-2">
					<img src={flowerImg} alt="flower" className="w-10 h-10" />
					<div> Мой сад</div>
				</div>
				<div className="side-menu__list flex flex-col gap-2 p-4">
					<Link className="side-menu__list-item cursor-pointer" to="/"> Сад </Link>
					<Link className="side-menu__list-item cursor-pointer" to="/goals"> Цели </Link>
					<Link className="side-menu__list-item cursor-pointer" to="/cementary"> Кладбище </Link>
					<Link className="side-menu__list-item cursor-pointer" to="/statls"> Статистика </Link>
				</div>
			</div>
		</>
	)
}

export default SideMenu;