import {useState} from 'react';
import Rose from '../../assets/flowers/rose/stage-1.png';
import Sunflower from '../../assets/flowers/sunflower/stage-1.png';
import Lavender from '../../assets/flowers/lavender/stage-1.png';
import Tulips from '../../assets/flowers/tulips/stage-1.png';

import "./FlowersPicker.scss";

function FlowersPicker() {
	const flowers = [
		{
			id:  '0',
			pic: Tulips,
		},
		{
			id:  '1',
			pic: Rose
		},
		{
			id:  '2',
			pic: Sunflower,
		},
		{
			id:  '3',
			pic: Lavender,
		},
	]

	const [selectedFlower, setFlower] = useState('0');

	return (
		<>
			<div className="flowers-picker flex mt-1">
				{flowers.map(flower => (
					<div className={`flowers-picker__flower ${selectedFlower === flower.id ? "flowers-picker__flower--selected" : ""}`}
					     key={flower.id}
					     onClick={() => setFlower(flower.id)}
					>
						<img src={flower.pic} alt='flower'/>
					</div>
				))}
			</div>
		</>
	)
}

export default FlowersPicker;