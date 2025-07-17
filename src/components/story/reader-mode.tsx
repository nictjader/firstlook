
"use client";

import type { Story } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sun, Moon, ZoomIn, ZoomOut, Library, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { Separator } from '@/components/ui/separator';

const FONT_SIZES = [
  'text-sm', // 14px
  'text-base', // 16px
  'text-lg', // 18px
  'text-xl', // 20px
  'text-2xl', // 24px
];

// --- Reader Mode Component ---
export const ReaderMode = ({ story, onBack, initialFontSizeIndex }: { story: Story; onBack: () => void; initialFontSizeIndex: number }) => {
  const { theme, setTheme } = useTheme();
  const [currentFontSizeIndex, setCurrentFontSizeIndex] = useState(initialFontSizeIndex);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const changeFontSize = (direction: 'increase' | 'decrease') => {
    setCurrentFontSizeIndex((prevIndex) => {
      const newIndex = direction === 'increase' ? prevIndex + 1 : prevIndex - 1;
      return Math.max(0, Math.min(newIndex, FONT_SIZES.length - 1));
    });
  };
  
  return (
    <Card className="shadow-xl animate-fade-in">
        <CardHeader className="sticky top-14 z-40 bg-background/80 backdrop-blur-sm border-b flex-row justify-between items-center py-2">
            <Button variant="outline" size="sm" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Details
            </Button>
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={() => changeFontSize('decrease')} aria-label="Decrease font size">
                    <ZoomOut className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => changeFontSize('increase')} aria-label="Increase font size">
                    <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>
        </CardHeader>
        <CardContent className={`py-6 prose dark:prose-invert max-w-none ${FONT_SIZES[currentFontSizeIndex]}`}>
            <h1 className="text-3xl md:text-4xl font-headline text-primary !mb-2">{story.title}</h1>
            <p className="lead !text-muted-foreground !mt-0">{story.previewText}</p>
            <Separator className="my-6" />
            <div dangerouslySetInnerHTML={{ __html: story.content }} />
        </CardContent>
    </Card>
  )
}
