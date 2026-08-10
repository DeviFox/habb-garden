import {Flowers} from '../types/flowers.ts';

const images = import.meta.glob('../assets/flowers/**/*.png', {eager: true})

const folderMap: Record<Flowers, string> = {
	[Flowers.ROSE]:      'rose',
	[Flowers.SUNFLOWER]: 'sunflower',
	[Flowers.TULIP]:     'tulips',
	[Flowers.DAFFODIL]:  'daffodil',
	[Flowers.DAISY]:     'daisy',
	[Flowers.HYDRANGEA]: 'hydrangea',
	[Flowers.LAVENDER]:  'lavender',
	[Flowers.LILLY]:     'lily',
	[Flowers.ORCHID]:    'orchid',
	[Flowers.PEONY]:     'peony',
}

export class PlantsMatcher {
	matchPlant(flower: Flowers, stage: number): string | undefined {
		const folder = folderMap[flower]
		if (!folder) {
			return undefined;
		}

		const module = images[`../assets/flowers/${folder}/stage-${stage}.png`] as { default: string } | undefined
		if (!module) {
			return undefined;
		}

		return module.default
	}

	matchPlantHp(hitpoint: number) {
		switch (hitpoint) {
			case 5:
				return 1;
			case 4:
				return 2;
			case 3:
				return 3;
			case 2:
				return 4;
			case 1:
				return 5;

			default:
				return 5;
		}
	}
}