import { useState, useEffect, useMemo, useRef } from 'react'

import { v4 as uuidv4 } from 'uuid'
import './App.css'
import { FaStore, FaLock, FaTrash } from 'react-icons/fa'; // Make sure to install react-icons package

import cookie from '/cookie.png';
import skeleton from '/skeleton.jpg';
import grandma from '/grandma.jpg';
import farm from '/farmer.jpg';
import mine from '/mine.jpg';
import factory from '/factory.jpg';
import bank from '/bank.jpg';
import temple from '/cathedral.jpg';
import coinflip from '/coinflip.jpg';
import cardBooster from '/booster.jpg';
import theFaker from '/thefaker.jpg';
import goldenMine from '/golden_mine.jpg';
import cookieCastle from '/cookieCastle.jpg';
import cookieRobot from '/cookierobot.jpg';
import cookiePortal from '/cookieportal.jpg';
import cookieAngel from '/cookieAngel2.jpg';

const RARITY_CHANCES: Record<number, Record<Rarity, number>> = {
  1: { common: 0.80, uncommon: 0.20, rare: 0, epic: 0, legendary: 0, mythical: 0 },
  2: { common: 0.70, uncommon: 0.25, rare: 0.05, epic: 0, legendary: 0, mythical: 0 },
  3: { common: 0.60, uncommon: 0.30, rare: 0.08, epic: 0.02, legendary: 0, mythical: 0 },
  4: { common: 0.50, uncommon: 0.30, rare: 0.15, epic: 0.04, legendary: 0.01, mythical: 0 },
  5: { common: 0.40, uncommon: 0.30, rare: 0.20, epic: 0.08, legendary: 0.02, mythical: 0 },
  6: { common: 0.30, uncommon: 0.30, rare: 0.25, epic: 0.10, legendary: 0.04, mythical: 0.01 },
};

const GENERATOR_IMAGES: Record<string, string> = {
  cookie,
  skeleton,
  grandma,
  farm,
  mine,
  factory,
  bank,
  temple,
  coinflip,
  cardBooster,
  theFaker,
  goldenMine,
  cookieCastle,
  cookieRobot,
  cookiePortal,
  cookieAngel,
};

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
type FoilType = 'normal' | 'holo' | 'reverse-holo' | 'full-art' | 'phantom';

interface Generator {
  id: string;
  name: string;
  rarity: Rarity;
  cps: number;
  weight: number;
  isOneTimeUse: boolean;
  level: number;
  description: string;
}

interface GeneratorInstance extends Generator {
  instanceId: string;
  enhancements: number;
  currentCps: number;
  isLocked: boolean;
  isOneTimeUse: boolean;
  foilType: FoilType;
  uses: number;
}

interface EvolutionPrompt {
  generator: GeneratorInstance;
  enhancer: GeneratorInstance;
  cost: number;
}

interface CoinflipResult {
  won: boolean;
  randomValue: number;
  amount: number;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#ffffff',
  uncommon: '#00ff00',
  rare: '#0099ff',
  epic: '#9900ff',
  legendary: '#ffaa00',
  mythical: '#ff0000',
}

const FOIL_CHANCES: Record<FoilType, number> = {
  normal: 0.939,
  holo: 0.05,
  'reverse-holo': 0.01,
  'full-art': 0.001,
  'phantom': 0,
};

const FAKER_CHANCES: Record<FoilType, number> = {
  normal: 0,
  holo: 0.5,
  'reverse-holo': 0.299,
  'full-art': 0.2,
  'phantom': 0.001,
};

const FOIL_BONUSES: Record<FoilType, number> = {
  normal: 1,
  holo: 1.25,
  'reverse-holo': 1.5,
  'full-art': 2,
  'phantom': 4,
};

const FOIL_CHANCE_BUFFS: Record<FoilType, number> = {
  normal: 0,
  holo: 0.05,
  'reverse-holo': 0.1,
  'full-art': 0.2,
  'phantom': 1
};

const GENERATOR_POOL: Generator[] = [
  { id: 'skeleton', name: 'Skeleton Clicker', rarity: 'common', cps: 0.1, weight: 100, isOneTimeUse: false, level: 1, description: "A spooky skeleton that clicks cookies for you." },
  { id: 'grandma', name: 'Grandma', rarity: 'common', cps: 0.5, weight: 80, isOneTimeUse: false, level: 1, description: "A sweet old lady who bakes cookies with love." },
  { id: 'farm', name: 'Farm', rarity: 'common', cps: 1, weight: 40, isOneTimeUse: false, level: 1, description: "A small farm that grows cookies on trees." },
  { id: 'mine', name: 'Mine', rarity: 'uncommon', cps: 2, weight: 30, isOneTimeUse: false, level: 1, description: "A deep mine filled with cookie ores." },
  { id: 'factory', name: 'Factory', rarity: 'uncommon', cps: 10, weight: 15, isOneTimeUse: false, level: 1, description: "An industrial factory that mass-produces cookies." },
  { id: 'bank', name: 'Bank', rarity: 'uncommon', cps: 15, weight: 10, isOneTimeUse: false, level: 1, description: "A financial institution that invests in cookie futures." },
  { id: 'temple', name: 'Temple', rarity: 'uncommon', cps: 30, weight: 5, isOneTimeUse: false, level: 1, description: "An ancient temple where cookies are worshipped." },
  { id: 'coinflip', name: 'Coinflip', rarity: 'uncommon', cps: 0.1, weight: 5, isOneTimeUse: true, level: 1, description: "Flip a coin to double your cookies or lose them all." },
  { id: 'cardBooster', name: 'Card Booster', rarity: 'uncommon', cps: 0.1, weight: 5, isOneTimeUse: true, level: 1, description: "Drag onto another card to increase its CPS drastically." },
  { id: 'theFaker', name: 'The Faker', rarity: 'rare', cps: 0.1, weight: 5, isOneTimeUse: true, level: 1, description: "Drag onto another card to change its foil. Has the potential to give the phantom foil." },
  
  { id: 'goldenMine', name: 'Golden Mine', rarity: 'rare', cps: 500, weight: 2, isOneTimeUse: false, level: 1, description: "A mine filled with golden cookie ores, producing a large amount of cookies." },
  { id: 'cookieCastle', name: 'Cookie Castle', rarity: 'rare', cps: 1000, weight: 2, isOneTimeUse: false, level: 1, description: "A majestic castle that bakes cookies in large quantities." },
  { id: 'cookieRobot', name: 'Cookie Robot', rarity: 'epic', cps: 5000, weight: 1, isOneTimeUse: false, level: 1, description: "A robot designed to bake cookies at an incredible rate." },
  { id: 'cookiePortal', name: 'Cookie Portal', rarity: 'epic', cps: 10000, weight: 1, isOneTimeUse: false, level: 1, description: "A portal that connects to a dimension filled with cookies." },
  { id: 'cookieAngel', name: 'Cookie Angel', rarity: 'epic', cps: 20000, weight: 1, isOneTimeUse: false, level: 1, description: "An angel that grants an immense amount of cookies." },
]

const BASE_ROLL_COST = 20;
const BASE_MULTI_ROLL_COST = 160;
const ROLL_COST_MULTIPLIER = 8;
const MULTI_ROLL_COUNT = 8;
const MAX_INVENTORY_SIZE = 24; // 8x3 grid

function formatNumber(num: number): string {
  const absNum = Math.abs(num);
  if (absNum >= 1e21) {
    return (num / 1e21).toFixed(3) + 's';
  } else if (absNum >= 1e18) {
    return (num / 1e18).toFixed(3) + 'Q';
  } else if (absNum >= 1e15) {
    return (num / 1e15).toFixed(3) + 'q';
  } else if (absNum >= 1e12) {
    return (num / 1e12).toFixed(3) + 't';
  } else if (absNum >= 1e9) {
    return (num / 1e9).toFixed(3) + 'b';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(3) + 'm';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(3) + 'k';
  } else {
    return num.toFixed(2);
  }
}

function App() {
  const [cookies, setCookies] = useState(() => {
    const savedCookies = localStorage.getItem('cookies')
    return savedCookies ? parseFloat(savedCookies) : 0
  })

  const [ownedGenerators, setOwnedGenerators] = useState<GeneratorInstance[]>(() => {
    const savedGenerators = localStorage.getItem('generators')
    return savedGenerators ? JSON.parse(savedGenerators) : []
  })

  const [activeDeck, setActiveDeck] = useState<(GeneratorInstance | null)[]>(() => {
    const savedActiveDeck = localStorage.getItem('activeDeck');
    return savedActiveDeck ? JSON.parse(savedActiveDeck) : Array(5).fill(null);
  });

  const [autoEvolveEnabled, setAutoEvolveEnabled] = useState<boolean>(() => {
    const savedAutoEvolve = localStorage.getItem('autoEvolveEnabled');
    return savedAutoEvolve ? JSON.parse(savedAutoEvolve) : false;
  });

  const [rollCost, setRollCost] = useState(BASE_ROLL_COST);
  const [multiRollCost, setMultiRollCost] = useState(BASE_MULTI_ROLL_COST);

  const [draggedBooster, setDraggedBooster] = useState<GeneratorInstance | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; value: number; x: number; y: number }[]>([]);
  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorInstance | null>(null);
  const [isRolling, setIsRolling] = useState(false)
  const [lastRolledGenerator, setLastRolledGenerator] = useState<GeneratorInstance | null>(null)
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [evolutionPrompt, setEvolutionPrompt] = useState<EvolutionPrompt | null>(null);
  const [selectedCoinflipCard, setSelectedCoinflipCard] = useState<GeneratorInstance | null>(null);
  const [coinflipResult, setCoinflipResult] = useState<CoinflipResult | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showWagerInput, setShowWagerInput] = useState(false);
  const [wagerAmount, setWagerAmount] = useState('');
  const coinflipRef = useRef<HTMLDivElement>(null);

  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCards, setRevealedCards] = useState<GeneratorInstance[]>([]);

  const [activeSlots, setActiveSlots] = useState<number>(() => {
    const savedSlots = localStorage.getItem('activeSlots');
    return savedSlots ? parseInt(savedSlots) : 1;
  });

  const [autoEnhanceEnabled, setAutoEnhanceEnabled] = useState<boolean>(() => {
    const savedAutoEnhance = localStorage.getItem('autoEnhanceEnabled');
    return savedAutoEnhance ? JSON.parse(savedAutoEnhance) : false;
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinItems, setSpinItems] = useState<GeneratorInstance[]>([]);
  const [spinResult, setSpinResult] = useState<GeneratorInstance | null>(null);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const spinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cookies', cookies.toString())
    localStorage.setItem('generators', JSON.stringify(ownedGenerators))
    localStorage.setItem('activeDeck', JSON.stringify(activeDeck));
    localStorage.setItem('activeSlots', activeSlots.toString());
    localStorage.setItem('autoEnhanceEnabled', JSON.stringify(autoEnhanceEnabled));
  }, [cookies, ownedGenerators, activeDeck, activeSlots, autoEnhanceEnabled])

  useEffect(() => {
    const costMultiplier = Math.pow(ROLL_COST_MULTIPLIER, activeSlots - 1);
    setRollCost(Math.round(BASE_ROLL_COST * costMultiplier));
    setMultiRollCost(Math.round(BASE_MULTI_ROLL_COST * costMultiplier));
  }, [activeSlots]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCookies(prevCookies => {
        const generation = activeDeck.reduce((acc, gen) => {
          if (gen) {
            return acc + (gen.currentCps * FOIL_BONUSES[gen.foilType]);
          }
          return acc;
        }, 0);
        return prevCookies + generation / 10; // Update every 100ms for smoother animation
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeDeck]);

  useEffect(() => {
    localStorage.setItem('autoEvolveEnabled', JSON.stringify(autoEvolveEnabled));
  }, [autoEvolveEnabled]);

  useEffect(() => {
    if (evolutionPrompt && autoEvolveEnabled) {
      handleEvolution(true);
    }
  }, [evolutionPrompt, autoEvolveEnabled]);

  useEffect(() => {
    if (autoEnhanceEnabled) {
      autoEnhance();
    }
  }, [ownedGenerators, activeDeck, autoEnhanceEnabled]);

  const resetGame = () => {
    setCookies(0);
    setOwnedGenerators([]);
    setActiveDeck(Array(6).fill(null));  // Reset active deck to 6 slots
    setLastRolledGenerator(null);
    setSelectedGenerator(null);
    setActiveSlots(1);  // Reset to only 1 active slot
    localStorage.removeItem('cookies');
    localStorage.removeItem('generators');
    localStorage.removeItem('activeDeck');
    localStorage.removeItem('activeSlots');  // Remove active slots from localStorage
  };

  const confirmReset = () => {
    if (window.confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      resetGame();
    }
  };

  const addCookies = (amount: number) => {
    setCookies(prevCookies => prevCookies + amount);
  };

  useEffect(() => {
    (window as any).addCookies = addCookies;
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, generator: GeneratorInstance, source: 'active' | 'inventory') => {
    if (generator.isLocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify({ generator, source }));
    e.currentTarget.classList.add('dragging');
    if (generator.id === 'cardBooster') {
      setDraggedBooster(generator);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedBooster(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const enhanceGenerator = (target: GeneratorInstance, enhancer: GeneratorInstance): GeneratorInstance => {
    if (target.id !== enhancer.id || enhancer.isLocked) {
      return target;
    }
    if (target.isOneTimeUse) {
      return {
        ...target,
        uses: target.uses + enhancer.uses
      };
    }
  
    const newEnhancements = target.enhancements + enhancer.enhancements + 1;
    const newCps = Math.max(target.currentCps, enhancer.currentCps)+Math.min(target.currentCps, enhancer.currentCps)*0.1;
    const newLvl = Math.max(target.level, enhancer.level);

    const enhancedGenerator = {
      ...target,
      enhancements: newEnhancements,
      currentCps: newCps,
      level: newLvl
    };
  
    while (newEnhancements % Math.pow(5, target.level) === 0 || newEnhancements > Math.pow(5, target.level)) {
      const evolutionCost = Math.pow(5,target.level);
      setEvolutionPrompt({ generator: target, enhancer: enhancer, cost: evolutionCost });
      return target; // Return the original target if evolution is prompted
    }
  
    return enhancedGenerator;
  };

  const handleRollAgain = () => {
    if (!isRolling && cookies >= multiRollCost && ownedGenerators.length <= MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT) {
      setIsRevealing(false);
      setRevealedCards([]);
      setTimeout(() => rollGenerator(MULTI_ROLL_COUNT), 100);
    }
  };

  const handleEvolution = (evolve: boolean) => {
    if (!evolutionPrompt) return;
    
    if ((evolve || autoEvolveEnabled) && cookies >= evolutionPrompt.cost) {
      setCookies(prevCookies => prevCookies - evolutionPrompt.cost);
      const evolvedGenerator = {
        ...evolutionPrompt.generator,
        currentCps: evolutionPrompt.generator.currentCps * 2, // 100% boost on evolution
        level: evolutionPrompt.generator.level + 1
      };
  
      setOwnedGenerators(prev => 
        prev.map(g => g.instanceId === evolvedGenerator.instanceId ? evolvedGenerator : g)
      );
  
      setActiveDeck(prev => 
        prev.map(g => g?.instanceId === evolvedGenerator.instanceId ? evolvedGenerator : g)
      );
  
      const element = document.querySelector(`[data-instance-id="${evolvedGenerator.instanceId}"]`);
      if (element) {
        element.classList.add('evolving');
        setTimeout(() => element.classList.remove('evolving'), 1000);
      }
    }
    else if (!autoEvolveEnabled){
      setOwnedGenerators(prev => [...prev, evolutionPrompt.enhancer]);  
    }
  
    setEvolutionPrompt(null);
  };

  const handleTrashDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    
    const { generator, source }: { generator: GeneratorInstance, source: 'active' | 'inventory' } = JSON.parse(data);
    
    if (generator.isLocked) return;

    if (source === 'active') {
      setActiveDeck(prev => prev.map(g => g?.instanceId === generator.instanceId ? null : g));
    } else {
      setOwnedGenerators(prev => prev.filter(g => g.instanceId !== generator.instanceId));
    }
  };

  const handleFakerReroll = (faker: GeneratorInstance, target: GeneratorInstance) => {
    const newFoilRoll = Math.random();
    let cumulativeFoilChance = 0;
    let newFoilType: FoilType = 'normal';
  
    for (const [type, chance] of Object.entries(FAKER_CHANCES)) {
      cumulativeFoilChance += chance;
      if (newFoilRoll < cumulativeFoilChance) {
        newFoilType = type as FoilType;
        break;
      }
    }
  
    const rerolledGenerator = {
      ...target,
      foilType: newFoilType,
      currentCps: target.cps * FOIL_BONUSES[newFoilType],
    };
  
    setOwnedGenerators(prev => {
      return prev.map(g => {
        if (g.instanceId === target.instanceId) return rerolledGenerator;
        if (g.instanceId === faker.instanceId) {
          return { ...g, uses: g.uses - 1 };
        }
        return g;
      }).filter(g => g.uses > 0);
    });
  
    setActiveDeck(prev => 
      prev.map(g => {
        if (g?.instanceId === target.instanceId) return rerolledGenerator;
        if (g?.instanceId === faker.instanceId) {
          return faker.uses > 1 ? { ...faker, uses: faker.uses - 1 } : null;
        }
        return g;
      })
    );
  
    // Add a visual effect to the rerolled card
    const element = document.querySelector(`[data-instance-id="${rerolledGenerator.instanceId}"]`);
    if (element) {
      element.classList.add('rerolled');
      setTimeout(() => element.classList.remove('rerolled'), 1000);
    }
  };
  

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number, target: 'active' | 'inventory') => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    
    const { generator, source }: { generator: GeneratorInstance, source: 'active' | 'inventory' } = JSON.parse(data);

    if (generator.id === 'theFaker') {
      const targetGenerator = target === 'active' ? activeDeck[index] : ownedGenerators[index];
      if (targetGenerator && !targetGenerator.isOneTimeUse) {
        handleFakerReroll(generator, targetGenerator);
        return;
      }
    }

    if (draggedBooster && generator.id == 'cardBooster') {
      const targetGenerator = target === 'active' ? activeDeck[index] : ownedGenerators[index];
      if (targetGenerator && !targetGenerator.isOneTimeUse) {
        handleBoost(generator, targetGenerator);
        return;
      }
    }

    if (source === target) {
      if (source === 'active') {
        setActiveDeck(prev => {
          const newDeck = [...prev];
          const oldIndex = prev.findIndex(g => g?.instanceId === generator.instanceId);
          if (oldIndex !== index) {
            [newDeck[oldIndex], newDeck[index]] = [newDeck[index], newDeck[oldIndex]];
          }
          return newDeck;
        });
      } else {
        const targetGenerator = ownedGenerators[index];
        if (targetGenerator && targetGenerator.instanceId === generator.instanceId) {
          // Card dropped into its original position, do nothing
          return;
        }
        if (targetGenerator && targetGenerator.id === generator.id) {
          setOwnedGenerators(prev => {
            const newInventory = [...prev];
            newInventory[index] = enhanceGenerator(targetGenerator, generator);
            return newInventory.filter(g => g.instanceId !== generator.instanceId);
          });
          const element = e.currentTarget.querySelector('.generator-card');
          if (element) {
            element.classList.add('enhancing');
            setTimeout(() => element.classList.remove('enhancing'), 1000);
          }
        } else {
          setOwnedGenerators(prev => {
            const newInventory = [...prev];
            const oldIndex = prev.findIndex(g => g.instanceId === generator.instanceId);
            if (oldIndex !== index) {
              newInventory.splice(oldIndex, 1);
              newInventory.splice(index, 0, generator);
            }
            return newInventory;
          });
        }
      }
    } else if (target === 'active') {
      const targetGenerator = activeDeck[index];
      if (targetGenerator && targetGenerator.id === generator.id && !targetGenerator.isLocked) {
        setActiveDeck(prev => {
          const newDeck = [...prev];
          newDeck[index] = enhanceGenerator(targetGenerator, generator);
          return newDeck;
        });
        setOwnedGenerators(prev => prev.filter(g => g.instanceId !== generator.instanceId));
        const element = e.currentTarget.querySelector('.generator-card');
        if (element) {
          element.classList.add('enhancing');
          setTimeout(() => element.classList.remove('enhancing'), 1000);
        }
      } else {
        setActiveDeck(prev => {
          const newDeck = [...prev];
          newDeck[index] = generator;
          return newDeck;
        });
        setOwnedGenerators(prev => {
          const newInventory = prev.filter(g => g.instanceId !== generator.instanceId);
          if (activeDeck[index]) {
            newInventory.push(activeDeck[index]!);
          }
          return newInventory;
        });
      }
    } else {
      if (ownedGenerators.length < MAX_INVENTORY_SIZE) {
        setOwnedGenerators(prev => [...prev, generator]);
        setActiveDeck(prev => prev.map(g => g?.instanceId === generator.instanceId ? null : g));
      }
    }
  };

  const toggleAutoEvolve = () => {
    setAutoEvolveEnabled(prev => !prev);
  };

  // Add this function to handle the card boost
  const handleBoost = (booster: GeneratorInstance, target: GeneratorInstance) => {
    const boostedCard = {
      ...target,
      currentCps: target.currentCps * 1.1 * FOIL_BONUSES[booster.foilType], // Increase CPS by 10% + any foiltype bonuses
    };
  
    setOwnedGenerators(prev => {
      return prev.map(g => {
        if (g.instanceId === target.instanceId) return boostedCard;
        if (g.instanceId === booster.instanceId) {
          return { ...g, uses: g.uses - 1 };
        }
        return g;
      }).filter(g => g.uses > 0);
    });
  
    setActiveDeck(prev => 
      prev.map(g => {
        if (g?.instanceId === target.instanceId) return boostedCard;
        if (g?.instanceId === booster.instanceId) {
          return booster.uses > 1 ? { ...booster, uses: booster.uses - 1 } : null;
        }
        return g;
      })
    );
  
    // Add a visual effect to the boosted card
    const element = document.querySelector(`[data-instance-id="${boostedCard.instanceId}"]`);
    if (element) {
      element.classList.add('boosted');
      setTimeout(() => element.classList.remove('boosted'), 1000);
    }
  };

  const totalCPS = useMemo(() => {
    return activeDeck.reduce((acc, gen) => {
      if (gen) {
        const foilBonus = FOIL_BONUSES[gen.foilType];
        return acc + (gen.currentCps * foilBonus);
      }
      return acc;
    }, 0);
  }, [activeDeck]);

  const handleClick = () => {
    const cookiesGained = Math.max(1, totalCPS);
    setCookies(prevCookies => prevCookies + cookiesGained);
    
    // Generate random position within the cookie image
    const x = Math.random() * 200 - 100; // Assuming the cookie is 200px wide
    const y = Math.random() * 200 - 100; // Assuming the cookie is 200px tall
  
    // Add new floating number
    setFloatingNumbers(prev => [
      ...prev,
      { id: Date.now(), value: cookiesGained, x, y }
    ]);
  
    // Remove the floating number after animation
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(num => num.id !== Date.now()));
    }, 2000); // Match this with the CSS animation duration
  };

  const getRandomGenerator = (): GeneratorInstance => {
    const rarityChances = RARITY_CHANCES[activeSlots];
    const rarityRoll = Math.random();
    let cumulativeChance = 0;
    let selectedRarity: Rarity = 'common';
  
    for (const [rarity, chance] of Object.entries(rarityChances)) {
      cumulativeChance += chance;
      if (rarityRoll < cumulativeChance) {
        selectedRarity = rarity as Rarity;
        break;
      }
    }
  
    const availableGenerators = GENERATOR_POOL.filter(gen => gen.rarity === selectedRarity);
    const selectedGenerator = availableGenerators[Math.floor(Math.random() * availableGenerators.length)];
  
    const foilRoll = Math.random();
    let cumulativeFoilChance = 0;
    let foilType: FoilType = 'normal';
  
    for (const [type, chance] of Object.entries(FOIL_CHANCES)) {
      cumulativeFoilChance += chance;
      if (foilRoll < cumulativeFoilChance) {
        foilType = type as FoilType;
        break;
      }
    }
  
    return {
      ...selectedGenerator,
      instanceId: uuidv4(),
      enhancements: 0,
      currentCps: selectedGenerator.cps * FOIL_BONUSES[foilType],
      isLocked: false,
      isOneTimeUse: selectedGenerator.isOneTimeUse,
      foilType,
      uses: 1
    };
  };

  const closeAnimation = () => {
    setIsRolling(false);
    setIsRevealing(false);
    setRevealedCards([]);
  };

  const rollGenerator = (count: number = 1) => {
    const cost = count === 1 ? rollCost : multiRollCost;
    if (cookies >= cost && ownedGenerators.length + count <= MAX_INVENTORY_SIZE && !isSpinning) {
      setCookies(prevCookies => prevCookies - cost);
      
      // Generate new generators
      const newGenerators = Array(count).fill(null).map(() => getRandomGenerator());
      
      if (count === 1) {
        setIsSpinning(true);
        // Single roll: Use spin animation
        const totalItems = 50;
        const visibleItems = 5;
        const spinItems = Array(totalItems).fill(null).map(() => getRandomGenerator());
        
        // Set the winning item
        const winningIndex = Math.floor(Math.random() * (totalItems - visibleItems)) + Math.floor(visibleItems / 2);
        const winningItem = spinItems[winningIndex];
        
        setSpinItems(spinItems);
        setSpinResult(winningItem);
        setIsRevealing(false);
  
        // Trigger the spin animation
        setSpinTrigger(prev => prev + 1);
  
        setOwnedGenerators(prevGenerators => [...prevGenerators, winningItem]);
        // Add the winning item to inventory before spin animation
        setTimeout(() => {
          setLastRolledGenerator(winningItem);
          setIsSpinning(false);
        }, 5500); // Slightly longer than the animation duration
      } else {
        // Multi-roll: Use reveal animation
        setRevealedCards(newGenerators)
        setIsRevealing(true);
  
        setOwnedGenerators(prevGenerators => [...prevGenerators, ...newGenerators]);
      }
    }
  };

  useEffect(() => {
    if (isSpinning && spinRef.current) {
      const itemWidth = 200; // Width of each spin item
      const visibleItems = 5;
      const winningIndex = spinItems.findIndex(item => item === spinResult);
      
      spinRef.current.style.transition = 'none';
      spinRef.current.style.transform = 'translateX(0px)';
      
      setTimeout(() => {
        if (spinRef.current) {
          spinRef.current.style.transition = 'all 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
          const finalPosition = (winningIndex - Math.floor(visibleItems / 2)) * itemWidth;
          spinRef.current.style.transform = `translateX(-${finalPosition}px)`;
        }
      }, 50);
    }
  }, [isSpinning, spinTrigger]);

  // Modify the handleSlotClick function
  const handleSlotClick = (generator: GeneratorInstance) => {
    if (generator.isOneTimeUse) {
      useOneTimeCard(generator);
    } else {
      setSelectedGenerator({ ...generator, isLocked: generator.isLocked || false });
    }
  };

  const closeSelectedGenerator = () => {
    setSelectedGenerator(null);
  };

  const toggleLock = () => {
    if (selectedGenerator) {
      const updatedGenerator = { ...selectedGenerator, isLocked: !selectedGenerator.isLocked };
      setSelectedGenerator(updatedGenerator);
      
      // Update the generator in ownedGenerators and activeDeck
      setOwnedGenerators(prev => prev.map(g => g.instanceId === updatedGenerator.instanceId ? updatedGenerator : g));
      setActiveDeck(prev => prev.map(g => g?.instanceId === updatedGenerator.instanceId ? updatedGenerator : g));
    }
  };

  const destroyGenerator = () => {
    if (selectedGenerator && !selectedGenerator.isLocked) {
      // Remove the generator from ownedGenerators and activeDeck
      setOwnedGenerators(prev => prev.filter(g => g.instanceId !== selectedGenerator.instanceId));
      setActiveDeck(prev => prev.map(g => g?.instanceId === selectedGenerator.instanceId ? null : g));
      closeSelectedGenerator();
    }
  };

  // Add a function to migrate existing generators
  const migrateGenerators = <T extends GeneratorInstance | null>(generators: T[]): T[] => {
    return generators.map(gen => 
      gen ? {
        ...gen,
        enhancements: gen.enhancements || 0,
        currentCps: gen.currentCps || gen.cps,
        isLocked: gen.isLocked || false
      } : gen
    ) as T[];
  };

  const updateGeneratorInState = (updatedGenerator: GeneratorInstance) => {
    setOwnedGenerators(prev => 
      prev.map(g => g.instanceId === updatedGenerator.instanceId ? updatedGenerator : g)
    );
    setActiveDeck(prev => 
      prev.map(g => g?.instanceId === updatedGenerator.instanceId ? updatedGenerator : g)
    );
  
    // Remove the generator if it has no more uses
    if (updatedGenerator.uses <= 0) {
      setOwnedGenerators(prev => prev.filter(g => g.instanceId !== updatedGenerator.instanceId));
      setActiveDeck(prev => prev.map(g => g?.instanceId === updatedGenerator.instanceId ? null : g));
    }
  };

  const useOneTimeCard = (generator: GeneratorInstance) => {
    if (generator.id === 'coinflip') {
      setSelectedCoinflipCard(generator);
      setShowWagerInput(true);

      // Decrease the number of uses
      const updatedGenerator = { ...generator, uses: generator.uses - 1 };
      updateGeneratorInState(updatedGenerator);
    }
  };

  const handleWagerSubmit = () => {
    const amount = parseInt(wagerAmount);
    if (isNaN(amount) || amount <= 0 || amount > cookies) {
      alert("Invalid wager amount. Please enter a valid number of cookies.");
      return;
    }

    setShowWagerInput(false);
    setIsFlipping(true);
    setShowResult(false);
    
    const randomValue = Math.random()+FOIL_CHANCE_BUFFS[selectedCoinflipCard?.foilType || 'normal'];
    const won = randomValue >= 0.5;

    setCoinflipResult({ won, randomValue, amount });

    // Remove the used card immediately
    if (selectedCoinflipCard) {
      // Remove only the selected card
      setOwnedGenerators(prev => prev.filter(g => g.instanceId !== selectedCoinflipCard.instanceId));
      setActiveDeck(prev => prev.map(g => g?.instanceId === selectedCoinflipCard.instanceId ? null : g));
    }

    setTimeout(() => {
      setIsFlipping(false);
      
      if (won) {
        setCookies(prevCookies => prevCookies + amount);
    } else {
        setCookies(prevCookies => prevCookies - amount);
      }

      // Show the result text after a short delay
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }, 2000); // 2 seconds for the animation
    setSelectedCoinflipCard(null);
  };

  // Add this effect to scroll to the coinflip result
  useEffect(() => {
    if (coinflipResult && coinflipRef.current) {
      coinflipRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [coinflipResult]);

  
  // Modify the useEffect that loads saved data
  useEffect(() => {
    const savedCookies = localStorage.getItem('cookies');
    if (savedCookies) setCookies(parseFloat(savedCookies));

    const savedGenerators = localStorage.getItem('generators');    
    if (savedGenerators) {
      const parsedGenerators = JSON.parse(savedGenerators);
      setOwnedGenerators(migrateGenerators(parsedGenerators));
    }

    const savedActiveDeck = localStorage.getItem('activeDeck');
    if (savedActiveDeck) {
      const parsedActiveDeck = JSON.parse(savedActiveDeck);
      setActiveDeck(migrateGenerators(parsedActiveDeck));
    }

    const savedSlots = localStorage.getItem('activeSlots');
    if (savedSlots) setActiveSlots(parseInt(savedSlots));

    const savedAutoEnhance = localStorage.getItem('autoEnhanceEnabled');
    if (savedAutoEnhance) setAutoEnhanceEnabled(JSON.parse(savedAutoEnhance));
  }, []);

  const toggleAutoEnhance = () => {
    setAutoEnhanceEnabled((prev: boolean) => !prev);
  };

  const autoEnhance = () => {
    console.log("Auto Enhance triggered");
    
    const allGenerators = [...ownedGenerators, ...activeDeck.filter((g): g is GeneratorInstance => g !== null)];
    const enhanceableGenerators = allGenerators;
  
    console.log("Enhanceable generators:", enhanceableGenerators);
  
    if (enhanceableGenerators.length < 2) {
      console.log("Not enough enhanceable generators");
      return;
    }
  
    // Group generators by name
    const generatorGroups = enhanceableGenerators.reduce((groups, generator) => {
      if (!groups[generator.name]) {
        groups[generator.name] = [];
      }
      groups[generator.name].push(generator);
      return groups;
    }, {} as Record<string, GeneratorInstance[]>);
  
    console.log("Generator groups:", generatorGroups);
  
    let enhanced = false;
  
    Object.values(generatorGroups).forEach(group => {
      if (group.length >= 2) {
        // Sort by foil type (prioritizing best foils), then by locked status, then by enhancements
        group.sort((a, b) => {
          const foilOrder = { normal: 0, holo: 1, 'reverse-holo': 2, 'full-art': 3, 'phantom': 4 };
          if (foilOrder[a.foilType] > foilOrder[b.foilType]) return -1;
          if (foilOrder[a.foilType] < foilOrder[b.foilType]) return 1;
          if (a.isLocked && !b.isLocked) return -1;
          if (!a.isLocked && b.isLocked) return 1;
          return b.enhancements - a.enhancements;
        });
  
        const targetGenerator = group[0];
        const enhancerGenerator = group.find(g => !g.isLocked && g !== targetGenerator);
  
        if (!enhancerGenerator) {
          console.log(`No unlocked enhancer found for ${targetGenerator.name}`);
          return;
        }
        
        // Check if enhancement would require an evolution
        const newEnhancements = targetGenerator.enhancements + enhancerGenerator.enhancements + 1;
        if (newEnhancements % Math.pow(5, targetGenerator.level) === 0) {
          const evolutionCost = Math.pow(5, targetGenerator.level);
          if (cookies < evolutionCost) {
            console.log(`Not enough cookies for evolution. Skipping.`);
            return;
          }
          console.log(`Player has enough cookies for evolution. Evolving...`);
          
          // Perform evolution
          setCookies(prevCookies => prevCookies - evolutionCost);
          const evolvedGenerator = {
            ...targetGenerator,
            currentCps: targetGenerator.currentCps * 2, // Double the CPS
            level: targetGenerator.level + 1,
            enhancements: 0 // Reset enhancements after evolution
          };
  
          setOwnedGenerators(prev =>
            prev.map(g =>
              g.instanceId === targetGenerator.instanceId ? evolvedGenerator : 
              g.instanceId === enhancerGenerator.instanceId ? null : g
            ).filter(Boolean) as GeneratorInstance[]
          );
  
          setActiveDeck(prev => 
            prev.map(g => 
              g?.instanceId === targetGenerator.instanceId ? evolvedGenerator : 
              g?.instanceId === enhancerGenerator.instanceId ? null : g
            )
          );
  
          const element = document.querySelector(`[data-instance-id="${targetGenerator.instanceId}"]`);
          if (element) {
            element.classList.add('evolving');
            setTimeout(() => element.classList.remove('evolving'), 1000);
          }
  
          enhanced = true;
          return; // Skip regular enhancement
        }
  
        // Regular enhancement logic
        console.log(`Enhancing ${targetGenerator.name}`);
        console.log("Target generator:", targetGenerator);
        console.log("Enhancer generator:", enhancerGenerator);
  
        const enhancedGenerator = enhanceGenerator(targetGenerator, enhancerGenerator);
        console.log("Enhanced generator:", enhancedGenerator);
  
        // Transfer enhancements from sacrificed material
        enhancedGenerator.enhancements += enhancerGenerator.enhancements;
        enhancedGenerator.level = Math.max(enhancerGenerator.level, enhancedGenerator.level);
        enhancedGenerator.currentCps = Math.max(enhancerGenerator.currentCps, enhancedGenerator.currentCps)+Math.min(targetGenerator.currentCps, enhancerGenerator.currentCps)*0.1;
  
        setOwnedGenerators(prev =>
          prev.map(g =>
            g.instanceId === targetGenerator.instanceId ? enhancedGenerator : 
            g.instanceId === enhancerGenerator.instanceId ? null : g
          ).filter(Boolean) as GeneratorInstance[]
        );
  
        setActiveDeck(prev => 
          prev.map(g => 
            g?.instanceId === targetGenerator.instanceId ? enhancedGenerator : 
            g?.instanceId === enhancerGenerator.instanceId ? null : g
          )
        );
  
        const element = document.querySelector(`[data-instance-id="${targetGenerator.instanceId}"]`);
        if (element) {
          element.classList.add('enhancing');
          setTimeout(() => element.classList.remove('enhancing'), 1000);
        } else {
          console.log("Element not found for animation");
        }
  
        enhanced = true;
      }
    });
  
    if (!enhanced) {
      console.log("No generators were enhanced");
    }
  };
  
  const toggleShop = () => {
    setIsShopOpen(!isShopOpen);
  };

  const purchaseSlot = (slotNumber: number) => {
    const cost = Math.pow(100, slotNumber);
    if (cookies >= cost) {
      setCookies(prevCookies => prevCookies - cost);
      setActiveSlots(prevSlots => prevSlots + 1);
    }
  };

  const renderGeneratorCard = (generator: GeneratorInstance, source: 'active' | 'inventory') => (
    <div
      className={`generator-card ${generator.isOneTimeUse ? 'one-time-use' : ''} ${generator.isLocked ? 'locked' : ''} ${generator.foilType}`}
      style={{borderColor: RARITY_COLORS[generator.rarity]}}
      draggable={!generator.isLocked}
      onDragStart={(e) => handleDragStart(e, generator, source)}
      onDragEnd={handleDragEnd}
      onClick={() => handleSlotClick(generator)}
      data-instance-id={generator.instanceId}
      data-uses={generator.isOneTimeUse ? generator.uses : undefined}
    >
      <img src={GENERATOR_IMAGES[generator.id]} alt={generator.name} />
      <div className="card-info">
        <span>{generator.name}</span>
        {!generator.isOneTimeUse && (
          <span>{formatNumber(generator.currentCps * FOIL_BONUSES[generator.foilType])} CPS</span>
        )}
        {generator.level > 1 && <span>LVL {generator.level}</span>}
        {generator.isOneTimeUse && <span>Uses: {generator.uses}</span>} {/* Add this line */}
      </div>
    </div>
  );

  return (
    <div className="App">
      <h1>Cookie Clicker Gacha</h1>
      <div className="game-container">
        <div className="left-panel">
          <div className="cookie-container">
          <img 
            src={cookie} 
            alt="Cookie" 
            className="cookie" 
            onClick={handleClick}
            draggable="false"
          />
          {floatingNumbers.map(num => (
            <div
              key={num.id}
            className="floating-number"
              style={{ '--x': `${num.x}px`, '--y': `${num.y}px` } as React.CSSProperties}
          >
              +{formatNumber(num.value)}
          </div>
        ))}
      </div>
          <div className="stats">
            <p>Cookies: {formatNumber(cookies)}</p>
            <p>Per second: {formatNumber(totalCPS)}</p>
          </div>
          <button className="shop-button" onClick={toggleShop}>
            <FaStore /> Shop
          </button>

          <div 
            className="trash-slot"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleTrashDrop}
          >
            <FaTrash />
          </div>
      </div>
  
        <div className="right-panel">
          <div className="active-deck">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`active-slot ${index < activeSlots ? (activeDeck[index] ? 'filled' : 'empty') : 'locked'}`}
                onDragOver={index < activeSlots ? handleDragOver : undefined}
                onDragLeave={index < activeSlots ? handleDragLeave : undefined}
                onDrop={index < activeSlots ? (e) => handleDrop(e, index, 'active') : undefined}
              >
                {index < activeSlots ? (
                  activeDeck[index] && renderGeneratorCard(activeDeck[index], 'active')
                ) : (
                  <div className="locked-slot" onClick={() => purchaseSlot(index + 1)}>
                  <FaLock />
                    <span>{formatNumber(Math.pow(100, index + 1))} cookies</span>
                </div>
              )}
            </div>
            ))}
          </div>
          <div className="inventory">
            {ownedGenerators.map((generator, index) => (
              <div
                key={generator.instanceId}
                className="inventory-slot filled"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index, 'inventory')}
              >
                {renderGeneratorCard(generator, 'inventory')}
          </div>
        ))}
            {[...Array(MAX_INVENTORY_SIZE - ownedGenerators.length)].map((_, index) => (
              <div
                key={ownedGenerators.length + index}
                className="inventory-slot empty"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, ownedGenerators.length + index, 'inventory')}
              />
            ))}
      </div>
      </div>
        </div>

      {isShopOpen && (
        <div className="shop-overlay">
          <div className="shop-content">
            <h2>Generator Shop</h2>
            <button className="close-shop" onClick={toggleShop}>&times;</button>
            <div className="roll-buttons">
              <button 
                onClick={() => rollGenerator(1)} 
                disabled={cookies < rollCost || isRolling || ownedGenerators.length >= MAX_INVENTORY_SIZE}
              >
                {isRolling ? 'Rolling...' : `Roll Generator (Cost: ${rollCost} cookies)`}
              </button>
              <button 
                onClick={() => rollGenerator(MULTI_ROLL_COUNT)} 
                disabled={cookies < multiRollCost || isRolling || ownedGenerators.length > MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT}
              >
                {isRolling ? 'Rolling...' : `Roll 8 Generators (Cost: ${multiRollCost} cookies)`}
              </button>
        </div>
            
            {(isSpinning || isRevealing) && (
              <div className="roll-animation" onClick={closeAnimation}>
                <div className="roll-animation-content">
                  {isSpinning && (
                    <div className="spin-overlay">
                      <div className="spin-container">
                        <div className="spin-marker"></div>
                        <div className="spin-reel" ref={spinRef}>
                          {spinItems.map((item, index) => (
                            <div key={index} className={`spin-item ${item.rarity}`}>
                              <img src={GENERATOR_IMAGES[item.id]} alt={item.name} />
                              <div>{item.name}</div>
                            </div>
                          ))}
                        </div>
                        </div>
                      </div>
                    )}
                  {isRevealing && (
                    <div className="multi-roll-container">
                      {revealedCards.map((card, index) => (
                          <div
                            key={index}
                              className={`multi-card ${card.rarity} ${card.foilType}`} 
                              style={{
                                animationDelay: `${index * 0.15}s`
                              }}
                            >
                              <div className="card-inner">
                                <div className="card-front">?</div>
                                <div className="card-back">
                                  <img src={GENERATOR_IMAGES[card.id]} alt={card.name} />
                                  <div className="card-info">
                                    <span>{card.name}</span>
                                    <span>{formatNumber(card.currentCps)} CPS</span>
                                  </div>
                                </div>
                              </div>
                          </div>
                        ))}
                        <button 
                          className="roll-again-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRollAgain();
                            }}
                          disabled={isRolling || cookies < multiRollCost || ownedGenerators.length > MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT}
                          >
                          Roll Again
                        </button>
                        </div>
                      )}
                      </div>
                    </div>
                  )}
    
            {lastRolledGenerator && !isRolling && (
              <div className="last-rolled" style={{borderColor: RARITY_COLORS[lastRolledGenerator.rarity]}}>
                You got: {lastRolledGenerator.name} ({lastRolledGenerator.rarity})
        </div>
      )}
          </div>
        </div>
      )}

      {selectedGenerator && (
        <div className="selected-generator-overlay" onClick={closeSelectedGenerator}>
          <div className="selected-generator" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeSelectedGenerator}>&times;</button>
            <h3>{selectedGenerator.name}{selectedGenerator.foilType !== 'normal' ? ` (${selectedGenerator.foilType})` : ''}</h3>
            <p>{selectedGenerator.description}</p>
            <p>___________________________________</p>
            <p>Level: {selectedGenerator.level} | CPS: {formatNumber(selectedGenerator.currentCps * FOIL_BONUSES[selectedGenerator.foilType])} | {selectedGenerator.rarity}</p>
            {selectedGenerator.enhancements > 0 && <p>Enhancement Level: {selectedGenerator.enhancements}/{Math.pow(5, selectedGenerator.level)}</p>}
            <div className="generator-actions">
              <button onClick={toggleLock}>
                {selectedGenerator.isLocked ? 'Unlock' : 'Lock'}
              </button>
              <button onClick={destroyGenerator} disabled={selectedGenerator.isLocked}>
                Destroy
              </button>
            </div>
          </div>
        </div>
      )}

      {showWagerInput && (
        <div className="wager-input-overlay">
          <div className="wager-input-content">
            <h3>Enter Wager Amount</h3>
            <input
              type="number"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <div className="wager-input-buttons">
              <button onClick={handleWagerSubmit}>Confirm</button>
              <button onClick={() => setShowWagerInput(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {(isFlipping || coinflipResult) && (
        <div ref={coinflipRef} className="coinflip-result">
          <h3>Coinflip</h3>
          <div className="coinflip-visual">
            <div 
              className={`coinflip-marker ${isFlipping ? 'animating' : 'final-position'}`}
              style={{
                '--final-position': `${coinflipResult ? coinflipResult.randomValue * 100 : 0}%`
              } as React.CSSProperties}
            ></div>
          </div>
          {showResult && coinflipResult && (
            <p>You {coinflipResult.won ? 'won' : 'lost'} {coinflipResult.amount} cookies!</p>
          )}
          {!isFlipping && (
            <button onClick={() => {
              setCoinflipResult(null);
              setShowResult(false);
            }}>Close</button>
          )}
          </div>
      )}

      {evolutionPrompt && !autoEvolveEnabled && (
        <div className="evolution-overlay">
          <div className="evolution-content">
            <h2>Evolution Available!</h2>
            <p>{evolutionPrompt.generator.name} can evolve to the next level!</p>
            <p>Cost: {evolutionPrompt.cost} cookies</p>
            <p>This will level up the card and double its CPS.</p>
          <div className="evolution-buttons">
              <button onClick={() => handleEvolution(true)} disabled={cookies < evolutionPrompt.cost}>
                Evolve
              </button>
            <button onClick={() => handleEvolution(false)}>Cancel</button>
          </div>
        </div>
        </div>
      )}

      <div className="game-controls">
        <button 
          onClick={toggleAutoEnhance} 
          className={`auto-enhance-button ${autoEnhanceEnabled ? 'active' : ''}`}
        >
          Auto Enhance: {autoEnhanceEnabled ? 'ON' : 'OFF'}
        </button>

        <button 
          onClick={toggleAutoEvolve} 
          className={`auto-evolve-button ${autoEvolveEnabled ? 'active' : ''}`}
        >
          Auto Evolve: {autoEvolveEnabled ? 'ON' : 'OFF'}
        </button>
        

        <button onClick={confirmReset} className="reset-button">
          Reset Game
        </button>
          </div>

      {isSpinning && (
        <div className="spin-overlay">
          <div className="spin-container">
            <div className="spin-marker"></div>
            <div className="spin-reel" ref={spinRef}>
              {spinItems.map((item, index) => (
                <div key={index} className={`spin-item ${item.rarity}`}>
                  <img src={GENERATOR_IMAGES[item.id]} alt={item.name} />
                  <div>{item.name}</div>
          </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
  )
}

export default App