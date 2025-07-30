
/**
 * @fileoverview This file contains centralized configuration and constants for the application.
 * By defining shared values here, we ensure consistency and make future updates easier.
 */

import type { CoinPackage } from './types';

/**
 * The standard cost in coins for any premium story or chapter.
 * This is used by the AI to set prices and by admin tools to standardize them.
 */
export const PREMIUM_STORY_COST = 50;

/**
 * A fallback placeholder image URL for story covers.
 */
export const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x900/D87093/F9E4EB.png';


/**
 * Defines the packages of coins available for purchase.
 * This is the single source of truth for the "Buy Coins" page and any backend logic.
 */
export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'cp_100', coins: 100, priceUSD: 2.49, description: 'Unlocks 2 Stories' },
  { id: 'cp_275', coins: 275, priceUSD: 5.99, description: 'Unlocks 5 Stories' },
  { id: 'cp_650', coins: 650, priceUSD: 12.99, description: 'Unlocks 13 Stories', bestValue: true },
  { id: 'cp_1500', coins: 1500, priceUSD: 24.99, description: 'Unlocks 30 Stories' },
];
