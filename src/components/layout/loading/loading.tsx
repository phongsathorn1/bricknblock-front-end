import Image from 'next/image';
import logo from '@/assets/icons/brickNBlock.png';

export default function Loading() {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='flex flex-col items-center'>
        <div className='animate-bounce'>
          <Image src={logo} alt='Loading' width={200} height={200} />
        </div>
        <span className='mt-4 text-lg font-medium'>Loading...</span>
      </div>
    </div>
  );
}
