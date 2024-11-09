import Image from 'next/image';
import logo from '@/assets/icons/pascalwifhat.png';

export default function Loading() {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='flex flex-col items-center'>
        <div className='animate-bounce'>
          <Image src={logo} alt='Loading' width={100} height={100} />
        </div>
        <span className='mt-4 text-lg font-medium'>Loading...</span>
      </div>
    </div>
  );
}
