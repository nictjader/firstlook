
"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ALL_SUBGENRES, type Subgenre } from '../../lib/types';
import { capitalizeWords } from '../../lib/utils';
import { ListFilter } from 'lucide-react';

export default function SubgenreFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSubgenre = searchParams.get('subgenre') || 'all';

  const handleSubgenreChange = (subgenre: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subgenre === 'all') {
      params.delete('subgenre');
    } else {
      params.set('subgenre', subgenre);
    }
    const queryString = params.toString();
    // Navigate and prevent scrolling to the top
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const subgenresToDisplay: Array<'all' | string> = ['all', ...ALL_SUBGENRES];

  return (
    <div className="flex justify-center w-full">
      <Select value={currentSubgenre} onValueChange={handleSubgenreChange}>
        <SelectTrigger className="w-full max-w-xs sm:max-w-sm md:max-w-md text-sm h-10">
          <ListFilter className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Filter by Subgenre..." />
        </SelectTrigger>
        <SelectContent>
          {subgenresToDisplay.map((subgenre) => (
            <SelectItem key={subgenre} value={subgenre} className="text-sm">
              {capitalizeWords(subgenre)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
