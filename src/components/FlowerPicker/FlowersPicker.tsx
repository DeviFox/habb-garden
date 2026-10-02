import {useState} from 'react';
import Lavender from '../../assets/flowers/lavender/stage-1.png';
import Rose from '../../assets/flowers/rose/stage-1.png';
import Sunflower from '../../assets/flowers/sunflower/stage-1.png';
import Tulips from '../../assets/flowers/tulips/stage-1.png';

import "./FlowersPicker.scss";
import {Flowers} from '../../types/flowers.ts';

type FlowersPickerProps = {
	onSelect: (id: Flowers) => void,
}

function FlowersPicker({onSelect}: FlowersPickerProps) {
	const flowers = [
		{
			id:  Flowers.TULIP,
			pic: Tulips,
		},
		{
			id:  Flowers.ROSE,
			pic: Rose
		},
		{
			id:  Flowers.SUNFLOWER,
			pic: Sunflower,
		},
		{
			id:  Flowers.LAVENDER,
			pic: Lavender,
		},
	]

	const [selectedFlower, setFlower] = useState(Flowers.TULIP);

	function onSelectFlower(id: Flowers) {
		setFlower(id);
		onSelect(id);
	}

	return (
		<>
			<div className="flowers-picker flex mt-1">
				{flowers.map(flower => (
					<div
						className={`flowers-picker__flower ${selectedFlower === flower.id ? "flowers-picker__flower--selected" : ""}`}
						key={flower.id}
						onClick={() => onSelectFlower(flower.id)}
					>
						<img src={flower.pic} alt='flower'/>
					</div>
				))}
			</div>
		</>
	)
}

export default FlowersPicker;