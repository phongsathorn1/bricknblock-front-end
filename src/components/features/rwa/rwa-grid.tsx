import { RWACard } from './rwa-card';
import { RWACardProps } from '@/lib/types/rwa';

export function RWAGrid({ items }: { items: RWACardProps[] }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {items.map((item) => (
        <RWACard key={item.id} item={item} />
      ))}
    </div>
  );
}
