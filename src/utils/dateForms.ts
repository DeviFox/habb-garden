/**
 * Return's a right word form
 *
 * @param number
 */
export default function getWordDays(number: number): string {
	const cases  = [2, 0, 1, 1, 1, 2];
	const titles = ['день', 'дня', 'дней'];

	return titles[
		(number % 100 > 4 && number % 100 < 20)
			? 2
			: cases[(number % 10 < 5) ? number % 10 : 5]
		];
}
