import "./GoalCreate.scss";
import {useState} from 'react';
import getWordDays from '../../utils/dateForms.ts';
import Leaf from '../../assets/leaf.png';
import FlowersPicker from '../FlowerPicker/FlowersPicker.tsx';

function GoalCreate({onButtonClick}: { onButtonClick: () => void }) {
	const [selectedDate, setSelectedDate] = useState<string>(
		() => new Date().toISOString().slice(0, 10)
	)

	const daysLeft = Math.ceil((new Date(selectedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))


	return (
		<>
			<div className="goal-create__backdrop"/>
			<div className="goal-create">
				<div className="goal-create__header text-3xl font-bold mb-1">Новая цель</div>
				<div className="goal-create__subheader text-gray-600 mb-6">Создайте новую цель, чтобы вырастить её в своём саду</div>
				<div className="goal-create__form-name text-sm font-bold">
					1. Название цели
					<input className="goal-create__form-name_input mt-1" name="goal-name" maxLength={60}/>
				</div>
				<div className="goal-create__form-comment text-sm font-bold mt-6">
					2. Описание (необязательно)
					<input className="goal-create__form-name_input mt-1" name="goal-name" maxLength={60}/>
				</div>
				<div className="goal-create__form-flower text-sm font-bold mt-6">
					3. Выберите цветок
					<FlowersPicker/>
				</div>
				<div className="goal-create__form-term text-sm font-bold mt-6">
					4. Срок выполнения
					<div className="goal-create__form-term_row mt-1">
						<input
							className="goal-create__form-term_input"
							name="goal-term"
							type="date"
							value={selectedDate}
							onChange={(e) => {
								setSelectedDate(e.target.value)
							}}
						/>

						{daysLeft > 0 &&
							<div className="goal-create__form-term_notification relative">
								<img className="w-4 h-4 absolute left-2 top-2" src={Leaf} alt='leaf'/>
								{`Цель будет считаться выполненной, если вы достигнете её за ${daysLeft} ${getWordDays(daysLeft)}. `}
							</div>
						}
					</div>
				</div>
				<div className="goal-create__footer flex">
					<button className="goal-create__footer-btn" onClick={onButtonClick}> Отменить </button>
					<button className="goal-create__footer-btn" onClick={onButtonClick}> Создать </button>
				</div>
			</div>
		</>
	)
}

export default GoalCreate;