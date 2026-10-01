// Economy and progression values are kept together for tuning.
export const FARM_SIZES = [3, 6, 9, 12, 16, 20] as const;
export const FARM_COSTS = [120, 220, 360, 600, 900] as const;
export const WATERING_COSTS = [250, 650] as const;
export const HOME_COSTS = [200, 450, 800] as const;
export const ART_PRICES = { painting: 80, model: 110, sculpture: 90 } as const;
// used counts successful artwork sales today, not creations.
export type ArtDay = { mood: 'calm' | 'inspired'; limit: 1 | 2; used: number };
export function rollArtDay(rng = Math.random): ArtDay {
  const inspired = rng() < .4;
  return { mood: inspired ? 'inspired' : 'calm', limit: inspired ? 2 : 1, used: 0 };
}
export const moodName = (day: ArtDay) => day.mood === 'inspired' ? 'มีแรงบันดาลใจ' : 'อยากใช้วันสบาย ๆ';
