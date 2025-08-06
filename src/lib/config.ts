
/**
 * @fileoverview This file contains centralized configuration and constants for the application.
 * By defining shared values here, we ensure consistency and make future updates easier.
 */

/**
 * The standard cost in coins for any premium story or chapter.
 * This is used by the AI to set prices and by admin tools to standardize them.
 */
export const PREMIUM_STORY_COST = 70;

/**
 * The base URL for the application.
 * Used for generating absolute URLs for sitemaps and metadata.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tryfirstlook.com';


/**
 * A fallback placeholder image URL for story covers.
 */
export const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x900/D87093/F9E4EB.png';


/**
 * Defines the available coin packages for purchase.
 */
export const COIN_PACKAGES = [
  {
    id: 'scribe',
    name: 'The Scribe',
    coins: 420,
    priceUSD: 4.99,
    label: null,
    messaging: 'Unlock 6 premium chapters.',
  },
  {
    id: 'aficionado',
    name: 'The Aficionado',
    coins: 1190,
    priceUSD: 9.99,
    label: 'Most Popular',
    messaging: 'Unlock 17 chapters! The perfect choice for avid readers.',
  },
  {
    id: 'loremaster',
    name: 'The Loremaster',
    coins: 3150,
    priceUSD: 19.99,
    label: 'Best Value',
    messaging: 'Unlock 45 chapters! Our lowest price per chapter.',
  },
];
