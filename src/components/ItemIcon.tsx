import { FLOWERS, itemName } from '../game/data';

export function ItemIcon({ id, size = 36, label }: { id: string; size?: number; label?: string }) {
  const grilled = id.startsWith('grilled:');
  const baseId = grilled ? id.slice(8) : id;
  const seed = id.startsWith('seed:');
  const flowerIndex = FLOWERS.findIndex(f => f.id === (seed ? id.slice(5) : id));
  const other = ['carp', 'goldfish', 'rare', 'bouquet', 'watering-can'].indexOf(baseId);
  const index = flowerIndex >= 0 ? flowerIndex : other;
  if (index < 0) return null;
  const sheet = flowerIndex >= 0 ? (seed ? 'seeds' : 'flowers') : 'fish-and-tools';
  const name = label ?? ({ bouquet: 'ช่อดอกไม้', 'watering-can': 'บัวรดน้ำ' }[id] ?? itemName(id));
  return <span className="item-icon" role="img" aria-label={name} style={{
    width: size, height: size, filter: grilled ? "sepia(.8) saturate(1.8) brightness(.8)" : undefined,
    backgroundImage: `url(/icons/pixelart/${sheet}.png)`,
    backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%`,
  }} />;
}
