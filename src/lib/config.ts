
/**
 * @fileoverview This file contains centralized configuration and constants for the application.
 * By defining shared values here, we ensure consistency and make future updates easier.
 */

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
 * Defines the available coin packages for purchase.
 */
export const COIN_PACKAGES = [
  {
    id: 'price_1PScQoRxW6aZ3d3bI4S2s1sN',
    name: 'Apprentice',
    coins: 500,
    price: 4.99,
    description: 'Perfect for dipping your toes into premium stories.',
  },
  {
    id: 'price_1PScQoRxW6aZ3d3bLz9r1n8t',
    name: 'Aficionado',
    coins: 1200,
    price: 9.99,
    description: 'The most popular choice for avid readers.',
    isPopular: true,
  },
  {
    id: 'price_1PScQoRxW6aZ3d3bR8t3s2pQ',
    name: 'Connoisseur',
    coins: 3000,
    price: 19.99,
    description: 'The best value for the truly devoted romance fan.',
  },
];
