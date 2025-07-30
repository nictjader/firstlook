
import Link from 'next/link';
import { BookHeart } from 'lucide-react';

interface LogoProps {
  isTextVisible?: boolean;
}

export default function Logo({ isTextVisible = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <BookHeart className="h-7 w-7 text-primary" />
      {isTextVisible && (
        <span className="font-headline text-2xl font-bold text-primary relative bottom-px">
          FirstLook
        </span>
      )}
    </Link>
  );
}
