import Construction from '../assets/construction.png';
import {useLocation} from 'react-router-dom';
import './ConstructionLayout.scss';

const ROUTE_LABELS: Record<string, { title: string; blurb: string }> = {
	'/goals':     {title: 'Грядка целей',       blurb: 'Готовится отдельный уголок, где можно будет управлять всеми растениями разом.'},
	'/cementary': {title: 'Кладбище',           blurb: 'Тихое место для увядших цветов и их эпитафий. Скоро откроется.'},
	'/stats':    {title: 'Статистика',          blurb: 'Листаем летопись сада: серии, выполнения, здоровье. Собираем бережно.'},
	'/guide':    {title: 'Гайд новичка',        blurb: 'Готовим карточки о том, как растить привычки без пропусков. Скоро.'},
	'/settings': {title: 'Настройки',           blurb: 'Собираем ручки и рычажки, которыми ты сможешь настроить свой сад.'},
};

function ConstructionLayout() {
	const {pathname} = useLocation();
	const meta       = ROUTE_LABELS[pathname] ?? {title: 'Эта грядка ещё готовится', blurb: 'Скоро здесь появится что-то живое.'};

	return (
		<div className="construction-layout flex-1 min-w-0 h-full pl-4">
			<div className="construction-layout__card">
				<div className="construction-layout__halo" aria-hidden/>
				<div className="construction-layout__stage">
					<img className="construction-layout__img" src={Construction} alt=""/>
				</div>
				<div className="construction-layout__body">
					<div className="construction-layout__kicker">Скоро в саду</div>
					<h1 className="construction-layout__title">{meta.title}</h1>
					<p className="construction-layout__blurb">{meta.blurb}</p>
				</div>
			</div>
		</div>
	);
}

export default ConstructionLayout;
