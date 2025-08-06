
/**
 * @fileoverview This file contains the authoritative pricing data for each chapter.
 * To perform a bulk price update, modify the data in this array and
 * run the "Standardize Story Prices" tool in the admin dashboard.
 */

interface ChapterPrice {
    chapterId: string;
    newCoinCost: number;
}

// To perform a bulk update, paste the new pricing data here.
// For example:
// export const chapterPricingData: ChapterPrice[] = [
//   { chapterId: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d", newCoinCost: 10 },
//   { chapterId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", newCoinCost: 10 },
//   { chapterId: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d", newCoinCost: 0 },
// ];

export const chapterPricingData: ChapterPrice[] = [
    // Paste your data here
];
