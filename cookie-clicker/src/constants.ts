import { Rarity, Generator } from './types';

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#ffffff',
  rare: '#0099ff',
  epic: '#9900ff',
  legendary: '#ffaa00'
};

export const GENERATOR_POOL: Generator[] = [
  { id: 'coinflip', name: 'Coinflip', rarity: 'common', cps: 0.1, weight: 1000, isOneTimeUse: true },
  { id: 'clicker', name: 'Clicker', rarity: 'common', cps: 0.1, weight: 100, isOneTimeUse: false },
  { id: 'grandma', name: 'Grandma', rarity: 'common', cps: 0.5, weight: 80, isOneTimeUse: false },
  { id: 'farm', name: 'Farm', rarity: 'rare', cps: 1, weight: 40, isOneTimeUse: false  },
  { id: 'mine', name: 'Mine', rarity: 'rare', cps: 2, weight: 30, isOneTimeUse: false },
  { id: 'factory', name: 'Factory', rarity: 'epic', cps: 10, weight: 15, isOneTimeUse: false },
  { id: 'bank', name: 'Bank', rarity: 'epic', cps: 15, weight: 10, isOneTimeUse: false },
  { id: 'temple', name: 'Temple', rarity: 'legendary', cps: 30, weight: 5, isOneTimeUse: false },
];

export const ROLL_COST = 20;
export const MULTI_ROLL_COST = 200;
export const MULTI_ROLL_COUNT = 8;
export const MAX_INVENTORY_SIZE = 24; // 8x3 grid