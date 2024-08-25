export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Generator {
  id: string;
  name: string;
  rarity: Rarity;
  cps: number;
  weight: number;
  isOneTimeUse: boolean;
}

export interface GeneratorInstance extends Generator {
  instanceId: string;
  enhancements: number;
  currentCps: number;
  isLocked: boolean;
}

export interface EvolutionPrompt {
  generator: GeneratorInstance;
  cost: number;
}

export interface CoinflipResult {
  won: boolean;
  randomValue: number;
  amount: number;
}