import Construction from '../assets/construction.png';
import './ConstructionLayout.scss';

function ConstructionLayout() {

	return (
		<>
			<div className={'construction-layout flex-1 min-w-0 h-full'}>
				<img className={'construction-layout__img w-150 h-150'} src={Construction} alt={'in construction img'}/>
			</div>
		</>
	)
}

export default ConstructionLayout;