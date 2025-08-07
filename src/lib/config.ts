
/**
 * @fileoverview This file centralizes application-wide constants and configurations.
 * This includes values like coin costs, placeholder URLs, and other static data
 * to avoid hardcoding values in multiple components.
 */

// The standard cost for a premium story or chapter.
export const PREMIUM_STORY_COST = 50;

// The placeholder URL to use for story covers when one isn't available.
export const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x900.png';

// An array of coin packages available for purchase in the app.
export const COIN_PACKAGES = [
  {
    id: 'price_1P6j0vGGxyYAaxJBw5sB59nL',
    name: 'Apprentice Trove',
    coins: 50,
    priceUSD: 0.50,
    messaging: 'Perfect for unlocking a single premium chapter.',
    label: null,
  },
  {
    id: 'price_1P6j1jGGxyYAaxJBk5sKxgdG',
    name: 'Storyteller\'s Stash',
    coins: 275,
    priceUSD: 2.49,
    messaging: 'Unlock a full multi-part series with bonus coins.',
    label: 'Most Popular',
  },
  {
    id: 'price_1P6j2cGGxyYAaxJB7gT384T0',
    name: 'Dragon\'s Hoard',
    coins: 750,
    priceUSD: 5.99,
    messaging: 'The ultimate package for the most avid readers.',
    label: 'Best Value',
  },
];
