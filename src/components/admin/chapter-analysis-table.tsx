
'use client';

import { type ChapterAnalysis } from '../../lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '../ui/table';
import { Badge } from '../ui/badge';
import { capitalizeWords } from '../../lib/utils';

interface ChapterAnalysisTableProps {
  data: ChapterAnalysis[];
}

export default function ChapterAnalysisTable({ data }: ChapterAnalysisTableProps) {
  if (!data || data.length === 0) {
    return <p>No chapter data to display.</p>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableCaption>A list of all chapters in the database.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Chapter Title</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Story Type</TableHead>
            <TableHead>Part #</TableHead>
            <TableHead className="text-right">Word Count</TableHead>
            <TableHead className="text-right">Coin Cost</TableHead>
            <TableHead className="text-right">Chapter ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((chapter) => (
            <TableRow key={chapter.chapterId}>
              <TableCell className="font-medium">{chapter.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{capitalizeWords(chapter.subgenre)}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={chapter.storyType === 'Series' ? 'secondary' : 'outline'}>
                  {chapter.storyType}
                </Badge>
              </TableCell>
              <TableCell>{chapter.partNumber ?? 'N/A'}</TableCell>
              <TableCell className="text-right">{chapter.wordCount.toLocaleString()}</TableCell>
              <TableCell className={`text-right font-semibold ${chapter.currentCoinCost > 0 ? 'text-primary' : 'text-green-600'}`}>
                {chapter.currentCoinCost}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">{chapter.chapterId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
