import { useState, useEffect, useMemo, useRef } from 'react'

import { v4 as uuidv4 } from 'uuid'
import './App.css'
import { FaStore, FaLock, FaTrash, FaTrophy, FaRedo } from 'react-icons/fa'; // Make sure to install react-icons package
import Slider from '@mui/material/Slider'
import Achievements, { Achievement } from './Achievements'

import cookie from '/cookie.png';
import skeleton from '/skeleton.jpg';
import grandma from '/grandma.jpg';
import farm from '/farmer.jpg';
import mine from '/mine.jpg';
import factory from '/cookieFactory.jpg';
import bank from '/bank.jpg';
import cathedral from '/cathedral.jpg';
import coinflip from '/coinflip.jpg';
import cardBooster from '/booster.jpg';
import theFaker from '/thefaker.jpg';
import goldenMine from '/golden_mine.jpg';
import cookieCastle from '/cookieCastle.jpg';
import cookieRobot from '/cookierobot.jpg';
import cookiePortal from '/cookieportal.jpg';
import cookieAngel from '/cookieAngel.jpg';
import queen from '/queen.jpg';
import cookieGoddess from '/CookieGoddesss.jpg';
import demonLord from '/demonlord.jpg';
import designer from '/designer.jpg';
import priest from '/priest.jpg';
import knight from '/Knight.jpg';
import deliveryboy from '/deliveryboy.jpg';
import wheatFields from '/farmer2.jpg';
import apostle from '/Apostle.jpg';
import omniscience from '/Omniscience.jpg';
import omnipotence from '/Omnipotence.jpg';
import godsgarden from '/godsgarden.jpg';
import garden from '/garden.jpg';
import latetowork from '/latetowork.jpg';
import excalibur from '/excalibur.jpg';
import temple from '/Temple.jpg';
import goldenGarden from '/goldenGarden.jpg';
import rain from '/rain.jpg';
import vengeance from '/vengeance.jpg';
import destruction from '/destruction.jpg';
import sorrow from '/sorrow.jpg';
import fallenAngel from '/fallenAngel.jpg';
import forestGuardian from '/forestGuardian.jpg';
import yin from '/Yin.jpg';
import yang from '/yang.jpg';

import galaxy from '/galaxy.jpg';
import constellation from '/constellation.jpg';
import crystalCave from '/crystalCave.jpg';
import scholar from '/scholar.jpg';
import alchemist from '/alchemist.jpg';
import astrologist from '/astrologist.jpg';
import berserk from '/berserk.jpg';
import storage from '/storage.jpg';
import afterlife from '/afterlife.jpg';

// COMPLETED CHANGES
// - PRESTIGE SYSTEM - JUST KEEP IT SIMPLE, WHEN YOU PRESTIGE, YOUR COOKIES CONVERT INTO MYTHICAL COOKIES, YOU ONLY KEEP VAULTED CARDS
// storage = lets you protect items from resetting when prestiging
// - Change high tier rolls to only be for mythical cookies
// - Make low level rolls (common/uncommon/small % rare) start at 100 cookies, and go up 5% for every pack opened

// CHANGES TO MAKE
// - Make trashing rare + cards give small number of mythical cookies back
// - Make daily quests for mythical cookies
// - Revamp the hype of the multi roll by showing animation first (unless quick roll is selected)
// - Make cards unlock their buffs after reaching evolution levels.  

// astrologist + galaxy + constellation ==> gives 1 mythical cookie every 5 minutes
// Alchemist = chance for mythical cookies, or for a huge bonus of cookies on click
// crystal cave - Every 10th click of the cookie gives random crystal - one time use stat booster or enhancer depending on what crystal you get
// Scholar = seems useless, but after a random time it will breakthrough, evolving into a mythical card. 

// Need to make sure scholar, cystal cave, alchemist, galaxy set are influenced by luck

const GENERIC_CRIT_RATE = 0.05;
const GENERIC_CRIT_MULTIPLIER = 5;

const LOW_LEVEL_RARITY_CHANCES: Record<Rarity, number> = {
  common: 0.70,
  uncommon: 0.25,
  rare: 0.05,
  epic: 0,
  legendary: 0,
  mythical: 0
};

const HIGH_LEVEL_RARITY_CHANCES: Record<Rarity, number> = {
  common: 0,
  uncommon: 0,
  rare: 0.60,
  epic: 0.35,
  legendary: 0.04,
  mythical: 0.01
};

const MULTI_ROLL_COUNT = 8;
const BASE_LOW_LEVEL_COST = 100;

const BOOST_LIMITS: Record<Rarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 10,
  epic: 5,
  legendary: 1,
  mythical: 0
};

const GENERATOR_IMAGES: Record<string, string> = {
  cookie,
  skeleton,
  grandma,
  farm,
  mine,
  factory,
  bank,
  coinflip,
  cardBooster,
  theFaker,
  goldenMine,
  cookieCastle,
  cookieRobot,
  cookiePortal,
  cookieAngel,
  queen,
  cookieGoddess,
  demonLord,
  designer,
  priest,
  knight,
  deliveryboy,
  wheatFields,
  cathedral,
  goldenGarden,
  rain,
  vengeance,
  destruction,
  sorrow,
  fallenAngel,
  forestGuardian,
  apostle,
  omniscience,
  omnipotence,
  godsgarden,
  garden,
  latetowork,
  excalibur,
  temple,
  yin, 
  yang,
  galaxy,
  constellation,
  astrologist,
  alchemist,
  berserk,
  storage,
  afterlife,
  crystalCave,
  scholar,
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
  onClick: number;
  critRate: number;
  critMultiplier: number;
  set: string;
  buffs?: Buff[];
}

interface GeneratorInstance extends Generator {
  instanceId: string;
  enhancements: number;
  currentCps: number;
  isLocked: boolean;
  isOneTimeUse: boolean;
  foilType: FoilType;
  uses: number;
  boosts: number;
  resetProtected: boolean;
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

interface Buff {
  type: 'cps' | 'critRate' | 'critMultiplier' | 'onClick' | 'sacrificeMultiplier' | 'luck';
  value: number;
}

interface SetBonus {
  setName: string;
  requiredCards: number;
  buff: Buff;
}

const SET_BONUSES: SetBonus[] = [
  { setName: 'Prayer Ritual', requiredCards: 3, buff: { type: 'critMultiplier', value: 10 } },
  { setName: 'B&W', requiredCards: 3, buff: { type: 'cps', value: 10 } },
  { setName: 'Death Meadow', requiredCards: 3, buff: { type: 'sacrificeMultiplier', value: 10 } },
  { setName: 'Craftmanship', requiredCards: 3, buff: { type: 'onClick', value: 10 } },
  { setName: 'Yin and Yang', requiredCards: 2, buff: { type: 'cps', value: 10 } },
  { setName: 'Holy', requiredCards: 4, buff: { type: 'luck', value: 0.4 } },
  { setName: 'Chivalry', requiredCards: 2, buff: { type: 'onClick', value: 10 } },
];

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#ffffff',
  uncommon: '#00ff00',
  rare: '#0099ff',
  epic: '#9900ff',
  legendary: '#ffaa00',
  mythical: '#ff0000',
}

const FOIL_CHANCES: Record<FoilType, number> = {
  normal: 0.984,
  holo: 0.01,
  'reverse-holo': 0.005,
  'full-art': 0.001,
  'phantom': 0,
};

const FAKER_CHANCES: Record<FoilType, number> = {
  normal: 0.5,
  holo: 0.4,
  'reverse-holo': 0.094,
  'full-art': 0.005,
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
  // Sets
  // Chivalry
  { id: 'excalibur', name: 'Excalibur', rarity: 'legendary', cps: 50000, weight: 1, isOneTimeUse: false, level: 1, description: "A legendary sword which creates cookies on each swing.", onClick: 50000, critRate: GENERIC_CRIT_RATE*2, critMultiplier: GENERIC_CRIT_MULTIPLIER*5, set: 'Chivalry', buffs: [{ type: 'critMultiplier', value: 1 }] },
  { id: 'knight', name: 'Knight', rarity: 'rare', cps: 1000, weight: 2, isOneTimeUse: false, level: 1, description: "A knight who serves the cookie nation.", onClick: 500, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Chivalry', buffs: [{ type: 'onClick', value: 0.3 }] },

  // Holy Set
  { id: 'priest', name: 'Priest', rarity: 'rare', cps: 500, weight: 2, isOneTimeUse: false, level: 1, description: "A priest who believes in the power of cookies.", onClick: 200, critRate: GENERIC_CRIT_RATE*2, critMultiplier: GENERIC_CRIT_MULTIPLIER*2, set: 'Holy', buffs: [{ type: 'critMultiplier', value: 0.1 }] },
  { id: 'apostle', name: 'Apostle', rarity: 'epic', cps: 5000, weight: 1, isOneTimeUse: false, level: 1, description: "An apostle that spreads the cookie gospel.", onClick: 2000, critRate: GENERIC_CRIT_RATE*2, critMultiplier: GENERIC_CRIT_MULTIPLIER*2, set: 'Holy', buffs: [{ type: 'critMultiplier', value: 0.1 }] },
  { id: 'cookieAngel', name: 'Cookie Angel', rarity: 'epic', cps: 20000, weight: 1, isOneTimeUse: false, level: 1, description: "An angel that grants an immense amount of cookies.", onClick: 5000, critRate: GENERIC_CRIT_RATE*5, critMultiplier: GENERIC_CRIT_MULTIPLIER*5, set: 'Holy', buffs: [{ type: 'critMultiplier', value: 0.5 }] },
  { id: 'cookieGoddess', name: 'Cookie Goddess', rarity: 'mythical', cps: 1000000, weight: 1, isOneTimeUse: false, level: 1, description: "A cookie goddess that has full control over the cookie dimension, boosting all cards crit rate by 50%, and crit multiplier by 100%.", onClick: 125000, critRate: GENERIC_CRIT_RATE*2, critMultiplier: GENERIC_CRIT_MULTIPLIER*2, set: 'Holy', buffs: [{ type: 'critRate', value: 0.5 }, { type: 'critMultiplier', value: 1 }] },

  // Celestial Set - Creates Mythical Cookies
  { id: 'astrologist', name: 'Astrologist', rarity: 'epic', cps: 10000, weight: 1, isOneTimeUse: false, level: 1, description: "An astrologist who can read the cookie stars.", onClick: 2000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Celestial', buffs: [{ type: 'cps', value: 0.1 }] },
  { id: 'galaxy', name: 'Galaxy', rarity: 'legendary', cps: 50000, weight: 1, isOneTimeUse: false, level: 1, description: "A galaxy full of cookie stars.", onClick: 10000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Celestial', buffs: [{ type: 'cps', value: 0.2 }] },
  { id: 'constellation', name: 'Constellation', rarity: 'epic', cps: 15000, weight: 1, isOneTimeUse: false, level: 1, description: "A constellation of cookie stars.", onClick: 3000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Celestial', buffs: [{ type: 'cps', value: 0.15 }] },

  // Yin and Yang
  { id: 'yin', name: 'Yin', rarity: 'legendary', cps: 50000, weight: 1, isOneTimeUse: false, level: 1, description: "One of the two primordial forces. When paired with Yang, CPS is greatly boosted.", onClick: 5000, critRate: GENERIC_CRIT_RATE, critMultiplier: 10, set: 'Yin and Yang'},
  { id: 'yang', name: 'Yang', rarity: 'legendary', cps: 50000, weight: 1, isOneTimeUse: false, level: 1, description: "One of the two primordial forces. When paired with Yin, CPS is greatly boosted.", onClick: 5000, critRate: GENERIC_CRIT_RATE, critMultiplier: 10, set: 'Yin and Yang'},

  // Prayer Ritual - Greatly boosts crit rate and crit multiplier of active deck
  { id: 'godsgarden', name: 'God\'s Garden', rarity: 'legendary', cps: 50000, weight: 1, isOneTimeUse: false, level: 1, description: "A garden that grows cookies at an incredible rate. While active, the garden boosts the cps of all cards in the active deck by 10%.", onClick: 20000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Prayer Ritual', buffs: [{ type: 'cps', value: 0.1 }]},
  { id: 'cathedral', name: 'Cathedral', rarity: 'uncommon', cps: 10, weight: 5, isOneTimeUse: false, level: 1, description: "An ancient temple where cookies are worshipped.", onClick: 2, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Prayer Ritual'},
  { id: 'latetowork', name: 'Curious Discovery', rarity: 'rare', cps: 500, weight: 1, isOneTimeUse: false, level: 1, description: "A cookie collector who finds a mysterious cookie field.", onClick: 250, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Prayer Ritual'},

  // Craftmanship - greatly increases on click
  { id: 'cookieRobot', name: 'Cookie Robot', rarity: 'epic', cps: 5000, weight: 1, isOneTimeUse: false, level: 1, description: "A robot designed to farm cookies at an incredible rate.", onClick: 5000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Craftmanship'},
  { id: 'designer', name: 'Designer', rarity: 'rare', cps: 1000, weight: 2, isOneTimeUse: false, level: 1, description: "A designer that can change the appearance of any card.", onClick: 125, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Craftmanship'},
  { id: 'factory', name: 'Factory', rarity: 'uncommon', cps: 10, weight: 15, isOneTimeUse: false, level: 1, description: "An industrial factory that mass-produces cookies.", onClick: 2, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Craftmanship'},

  // Black & White - boosts cps by 25%
  { id: 'skeleton', name: 'Skeleton Clicker', rarity: 'common', cps: 2, weight: 100, isOneTimeUse: false, level: 1, description: "A spooky skeleton that clicks cookies for you.", onClick: 0.1, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'B&W'},
  { id: 'grandma', name: 'Grandma', rarity: 'common', cps: 2, weight: 80, isOneTimeUse: false, level: 1, description: "A sweet old lady who bakes cookies with love.", onClick: 0.1, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'B&W'},
  { id: 'farm', name: 'Farm', rarity: 'common', cps: 1, weight: 40, isOneTimeUse: false, level: 1, description: "A small farm that grows cookies on trees.", onClick: 0.5, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'B&W'},

  // Death Meadow - greatly amplifies sacrifice gain
  { id: 'rain', name: 'Rain', rarity: 'rare', cps: 1000, weight: 1, isOneTimeUse: false, level: 1, description: "Tears of sorrow that fall from the sky.", onClick: 120, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Death Meadow'},
  { id: 'vengeance', name: 'Vengeance', rarity: 'epic', cps: 5000, weight: 1, isOneTimeUse: false, level: 1, description: "The wrath of the forsaken.", onClick: 2000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Death Meadow'},
  { id: 'destruction', name: 'Destruction', rarity: 'epic', cps: 10000, weight: 1, isOneTimeUse: false, level: 1, description: "The destroyer of worlds.", onClick: 1500, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: 'Death Meadow'},

  // Crit Cards
  { id: 'omniscience', name: 'Omniscience', rarity: 'legendary', cps: 0, weight: 1, isOneTimeUse: true, level: 1, description: "Fuse with omnipotence to awaken the cookie goddess.", onClick: 0, critRate: GENERIC_CRIT_RATE*2, critMultiplier: GENERIC_CRIT_MULTIPLIER*2, set: ''},

  // On Click Cards
  { id: 'deliveryboy', name: 'Delivery Boy', rarity: 'common', cps: 0.5, weight: 40, isOneTimeUse: false, level: 1, description: "A delivery boy who delivers cookies to your doorstep.", onClick: 0.5, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'onClick', value: 0.1 }]},
  { id: 'mine', name: 'Mine', rarity: 'uncommon', cps: 2, weight: 30, isOneTimeUse: false, level: 1, description: "A deep mine filled with cookie ores.", onClick: 0.5, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'onClick', value: 0.2 }]},
  { id: 'goldenMine', name: 'Golden Mine', rarity: 'rare', cps: 500, weight: 2, isOneTimeUse: false, level: 1, description: "A mine filled with golden cookie ores, producing a large amount of cookies.", onClick: 150, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'onClick', value: 0.3 }]},
  { id: 'omnipotence', name: 'Omnipotence', rarity: 'legendary', cps: 0, weight: 1, isOneTimeUse: true, level: 1, description: "Fuse with omniscience to awaken the cookie goddess.", onClick: 0, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: ''},
  { id: 'queen', name: 'Queen', rarity: 'mythical', cps: 5000000, weight: 1, isOneTimeUse: false, level: 1, description: "A cookie queen that rules over a cookie kingdom. While active, the queen boosts the CPS of active cards by 100% and on click by 100%.", onClick: 1000000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'cps', value: 1}, { type: 'onClick', value: 1}]},
  
  // Traditional CPS
  { id: 'wheatFields', name: 'Fields', rarity: 'common', cps: 5, weight: 40, isOneTimeUse: false, level: 1, description: "A field of premium cookie wheat.", onClick: 0.2, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'cps', value: 0.1 }]},
  { id: 'bank', name: 'Bank', rarity: 'uncommon', cps: 20, weight: 10, isOneTimeUse: false, level: 1, description: "A financial institution that invests in cookie futures.", onClick: 2, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'cps', value: 0.2 }]},
  { id: 'cardBooster', name: 'Card Booster', rarity: 'uncommon', cps: 0, weight: 3, isOneTimeUse: true, level: 1, description: "Drag onto another card to increase its CPS drastically.", onClick: 0, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'cps', value: 0.2 }]},
  { id: 'cookieCastle', name: 'Cookie Castle', rarity: 'rare', cps: 2000, weight: 2, isOneTimeUse: false, level: 1, description: "A majestic castle that bakes cookies in large quantities.", onClick: 100, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'cps', value: 0.3 }]},
  { id: 'cookiePortal', name: 'Cookie Portal', rarity: 'epic', cps: 20000, weight: 1, isOneTimeUse: false, level: 1, description: "A portal that connects to a dimension filled with cookies.", onClick: 1000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'cps', value: 0.4 }]},

  // Corruptive / Sacrificial Cards
  { id: 'forestGuardian', name: 'Forest Guardian', rarity: 'epic', cps: 20000, weight: 1, isOneTimeUse: false, level: 1, description: "The sacrifice loving guardian of the cookie forest.", onClick: 5000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'sacrificeMultiplier', value: 1.1 }]},
  { id: 'sorrow', name: 'Sorrow', rarity: 'epic', cps: 10000, weight: 1, isOneTimeUse: false, level: 1, description: "A sorrowful angel that boosts the sacrifice multiplier of all cards in the active deck by 10%.", onClick: 2000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'sacrificeMultiplier', value: 1.1 }]},
  { id: 'fallenAngel', name: 'Fallen Angel', rarity: 'legendary', cps: 100000, weight: 1, isOneTimeUse: false, level: 1, description: "An angel that has fallen from grace. Has the unique property that it can be enhanced using any card.", onClick: 20000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'sacrificeMultiplier', value: 1.1 }]},
  { id: 'demonLord', name: 'Demon Lord', rarity: 'mythical', cps: 1000000, weight: 1, isOneTimeUse: false, level: 1, description: "A demon lord who seeks eternal cookie dominion. Every foil card sacrificed to the Demon Lord permanently increases the Demon Lord's on click buff.", onClick: 200000, critRate: GENERIC_CRIT_RATE, critMultiplier: GENERIC_CRIT_MULTIPLIER, set: '', buffs: [{ type: 'onClick', value: 0.1 }]},

  // Unique Cards
  // { id: 'coinflip', name: 'Coinflip', rarity: 'uncommon', cps: 0.0, weight: 2, isOneTimeUse: true, level: 1, description: "Flip a coin to double your cookies or lose them all.", onClick: 0.5, critRate: 0, critMultiplier: 0, set: ''},
  { id: 'theFaker', name: 'The Faker', rarity: 'rare', cps: 0.0, weight: 5, isOneTimeUse: true, level: 1, description: "Drag onto another card for a chance to get a new foil. Has the potential to give an exclusive phantom foil.", onClick: 0, critRate: 0, critMultiplier: 0, set: ''},
  { id: 'storage', name: 'Storage', rarity: 'legendary', cps: 0, weight: 0, isOneTimeUse: true, level: 1, description: "Drag onto another card to permanently protect if from reset on prestiging.", onClick: 0, critRate: 0, critMultiplier: 0, set: ''},
  
]

const MAX_INVENTORY_SIZE = 32; // 8x3 grid

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
  // USE STATES
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const savedAchievements = localStorage.getItem('achievements');
    return savedAchievements ? JSON.parse(savedAchievements) : [
      { id: 'cookies_100', name: 'Cookie Novice', description: 'Reach 100 cookies', achieved: false, redeemed: false, reward: 1 },
      { id: 'cookies_100000', name: 'Cookie Apprentice', description: 'Reach 100,000 cookies', achieved: false, redeemed: false, reward: 5 },
      { id: 'cookies_1000000', name: 'Cookie Expert', description: 'Reach 1 million cookies', achieved: false, redeemed: false, reward: 10 },
      { id: 'cookies_1000000000', name: 'Cookie Master', description: 'Reach 1 billion cookies', achieved: false, redeemed: false, reward: 50 },
      { id: 'cookies_1000000000000', name: 'Cookie Legend', description: 'Reach 1 trillion cookies', achieved: false, redeemed: false, reward: 100 },
      { id: 'first_roll', name: 'Rookie Roller', description: 'Roll your first generator', achieved: false, redeemed: false, reward: 1 },
      { id: 'first_uncommon', name: 'Uncommon Find', description: 'Get your first uncommon generator', achieved: false, redeemed: false, reward: 5 },
      { id: 'first_rare', name: 'Rare Discovery', description: 'Get your first rare generator', achieved: false, redeemed: false, reward: 10 },
      { id: 'first_epic', name: 'Epic Acquisition', description: 'Get your first epic generator', achieved: false, redeemed: false, reward: 50 },
      { id: 'first_legendary', name: 'Legendary Feat', description: 'Get your first legendary generator', achieved: false, redeemed: false, reward: 100 },
      { id: 'first_mythical', name: 'Mythical Marvel', description: 'Get your first mythical generator', achieved: false, redeemed: false, reward: 500 },
    ];
  });

  const resetAchievements = () => {
    const defaultAchievements: Achievement[] = [
      { id: 'cookies_100', name: 'Cookie Novice', description: 'Reach 100 cookies', achieved: false, redeemed: false, reward: 1 },
      { id: 'cookies_100000', name: 'Cookie Apprentice', description: 'Reach 100,000 cookies', achieved: false, redeemed: false, reward: 5 },
      { id: 'cookies_1000000', name: 'Cookie Expert', description: 'Reach 1 million cookies', achieved: false, redeemed: false, reward: 10 },
      { id: 'cookies_1000000000', name: 'Cookie Master', description: 'Reach 1 billion cookies', achieved: false, redeemed: false, reward: 50 },
      { id: 'cookies_1000000000000', name: 'Cookie Legend', description: 'Reach 1 trillion cookies', achieved: false, redeemed: false, reward: 100 },
      { id: 'first_roll', name: 'Rookie Roller', description: 'Roll your first generator', achieved: false, redeemed: false, reward: 1 },
      { id: 'first_uncommon', name: 'Uncommon Find', description: 'Get your first uncommon generator', achieved: false, redeemed: false, reward: 5 },
      { id: 'first_rare', name: 'Rare Discovery', description: 'Get your first rare generator', achieved: false, redeemed: false, reward: 10 },
      { id: 'first_epic', name: 'Epic Acquisition', description: 'Get your first epic generator', achieved: false, redeemed: false, reward: 50 },
      { id: 'first_legendary', name: 'Legendary Feat', description: 'Get your first legendary generator', achieved: false, redeemed: false, reward: 100 },
      { id: 'first_mythical', name: 'Mythical Marvel', description: 'Get your first mythical generator', achieved: false, redeemed: false, reward: 500 },
    ];
  
    localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
    setAchievements(defaultAchievements);
  };

  const [showAchievements, setShowAchievements] = useState(false);
  const [mysticalCookies, setMysticalCookies] = useState(() => {
    const savedMysticalCookies = localStorage.getItem('mysticalCookies');
    return savedMysticalCookies ? parseInt(savedMysticalCookies) : 0;
  });

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

  const [rollPool, setRollPool] = useState<number>(1);
  const [lowLevelRollCount, setLowLevelRollCount] = useState(0);
  const [lowLevelRollCost, setLowLevelRollCost] = useState(BASE_LOW_LEVEL_COST);
  const [lastRollType, setLastRollType] = useState<'low' | 'high'>('low');

  const [draggedBooster, setDraggedBooster] = useState<GeneratorInstance | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; value: number; x: number; y: number, crit: boolean }[]>([]);
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

  // USE EFFECT HOOKS
  useEffect(() => {
    localStorage.setItem('cookies', cookies.toString())
    localStorage.setItem('generators', JSON.stringify(ownedGenerators))
    localStorage.setItem('activeDeck', JSON.stringify(activeDeck));
    localStorage.setItem('activeSlots', activeSlots.toString());
    localStorage.setItem('autoEnhanceEnabled', JSON.stringify(autoEnhanceEnabled));
  }, [cookies, ownedGenerators, activeDeck, activeSlots, autoEnhanceEnabled])

  // GENERATE COOKIES
  useEffect(() => {
    const interval = setInterval(() => {
      setCookies(prevCookies => {
        const buffs = calculateBuffs(activeDeck);
        const generation = activeDeck.reduce((acc, gen) => {
          if (gen) {
            return acc + (gen.currentCps * FOIL_BONUSES[gen.foilType] * Math.pow(1.25, gen.boosts) * buffs.cps);
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

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('mysticalCookies', mysticalCookies.toString());
  }, [mysticalCookies]);

  // FUNCTIONS
  const resetGame = () => {
    setCookies(0);
    setOwnedGenerators([]);
    setActiveDeck(Array(6).fill(null));  // Reset active deck to 6 slots
    setLastRolledGenerator(null);
    setSelectedGenerator(null);
    setActiveSlots(1);  // Reset to only 1 active slot
    resetAchievements();  // Reset achievements to default state

    localStorage.removeItem('cookies');
    localStorage.removeItem('generators');
    localStorage.removeItem('activeDeck');
    localStorage.removeItem('achievements');
    localStorage.removeItem('activeSlots');  // Remove active slots from localStorage
  };

  const confirmReset = () => {
    if (window.confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      resetGame();
    }
  };

  const calculateBuffs = (deck: (GeneratorInstance | null)[]): Record<string, number> => {
    const buffs: Record<string, number> = { cps: 1, critRate: 0, critMultiplier: 1, onClick: 1, sacrificeMultiplier: 1, luck: 0 };
    const activeSets: Record<string, number> = {};
  
    deck.forEach(card => {
      if (card) {
        // Apply individual card buffs
        if (card.buffs) {
          card.buffs.forEach(buff => {
            if (buff.type === 'cps') buffs.cps *= (1 + buff.value);
            else if (buff.type === 'critRate') buffs.critRate += buff.value;
            else if (buff.type === 'critMultiplier') buffs.critMultiplier *= (1 + buff.value);
            else if (buff.type === 'onClick') buffs.onClick += buff.value;
            else if (buff.type === 'sacrificeMultiplier') buffs.sacrificeMultiplier += (buff.value);
            else if (buff.type === 'luck') buffs.luck += (buff.value);
          });
        }
  
        // Count cards for set bonuses
        if (card.set) {
          activeSets[card.set] = (activeSets[card.set] || 0) + 1;
        }
      }
    });

    // Apply set bonuses
    SET_BONUSES.forEach(setBonus => {
      if (activeSets[setBonus.setName] >= setBonus.requiredCards) {
        if (setBonus.buff.type === 'cps') buffs.cps *= (1 + setBonus.buff.value);
        else if (setBonus.buff.type === 'critRate') buffs.critRate += setBonus.buff.value;
        else if (setBonus.buff.type === 'critMultiplier') buffs.critMultiplier *= (1 + setBonus.buff.value);
        else if (setBonus.buff.type === 'onClick') buffs.onClick += setBonus.buff.value;
        else if (setBonus.buff.type === 'sacrificeMultiplier') buffs.sacrificeMultiplier *= setBonus.buff.value;
        else if (setBonus.buff.type === 'luck') buffs.luck += setBonus.buff.value;
      }
    });

    return buffs;
  };

  const handleRollPoolChange = (event: Event, newValue: number | number[]) => {
    setRollPool(newValue as number);
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
    const buffs = calculateBuffs(activeDeck);
    let newEnhancements = target.enhancements + (enhancer.enhancements + 1) * buffs.sacrificeMultiplier;
    let newCps = target.currentCps;
    let newOnClick = target.onClick;
    let newLevel = target.level;
  
    if (target.id === 'fallenAngel') {
      // Special case for Fallen Angel: can be enhanced by any card
      newCps += enhancer.currentCps * 0.1 * buffs.sacrificeMultiplier;
      newOnClick += enhancer.onClick * 0.1 * buffs.sacrificeMultiplier;
    } else if (target.id === 'demonLord') {
      if(enhancer.foilType !== 'normal'){
        target.buffs = target.buffs?.map(buff => ({
          ...buff,
          value: buff.value * 1.1
        })) || []
      }
    }
    
    else if (target.id !== enhancer.id || enhancer.isLocked) {
      return target;
    } else if (target.isOneTimeUse) {
      return {
        ...target,
        uses: target.uses + enhancer.uses
      };
    } else {
      newCps = Math.max(target.currentCps, enhancer.currentCps) + Math.min(target.currentCps, enhancer.currentCps) * 0.1;
      newOnClick = Math.max(target.onClick, enhancer.onClick) + Math.min(target.onClick, enhancer.onClick) * 0.1;
    }
  
    const newBoost = Math.min(Math.max(target.boosts, enhancer.boosts), BOOST_LIMITS[target.rarity]);
  
    // Check for evolution
    if (newEnhancements >= Math.pow(5, target.level)) {
      newLevel += 1;
      newCps *= 2; // Double the CPS on evolution
      newOnClick *= 2; // Double the OnClick on evolution
      newEnhancements = 0; // Reset enhancements after evolution
    }
  
    return {
      ...target,
      enhancements: newEnhancements,
      currentCps: newCps,
      onClick: newOnClick,
      level: newLevel,
      boosts: newBoost
    };
  };

  const handleRollAgain = () => {
    if (!isRolling && ownedGenerators.length <= MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT) {
      setIsRevealing(false);
      setRevealedCards([]);
      setTimeout(() => {
        if (lastRollType === 'high') {
          if (mysticalCookies >= 8) {
            rollGenerator(MULTI_ROLL_COUNT, true);
          } else {
            alert("Not enough Mystical Cookies for a high-level roll.");
          }
        } else {
          if (cookies >= lowLevelRollCost * MULTI_ROLL_COUNT) {
            rollGenerator(MULTI_ROLL_COUNT, false);
          } else {
            alert("Not enough cookies for a low-level roll.");
          }
        }
      }, 100);
    }
  };
  

  const handleEvolution = (evolve: boolean) => {
    if (!evolutionPrompt) return;
    
    if ((evolve || autoEvolveEnabled) && cookies >= evolutionPrompt.cost) {
      setCookies(prevCookies => prevCookies - evolutionPrompt.cost);
      const evolvedGenerator = {
        ...evolutionPrompt.generator,
        currentCps: evolutionPrompt.generator.currentCps * 2, // 100% boost on evolution
        onClick: evolutionPrompt.generator.onClick * 2, // 100% boost on evolution
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
      foilType: newFoilType
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

    if (generator.id === 'storage') {
      const targetGenerator = target === 'active' ? activeDeck[index] : ownedGenerators[index];
      if (targetGenerator) {
        // Change the card's resetProtected field to true
        const updatedGenerator = { ...targetGenerator, resetProtected: true };
        
        if (target === 'active') {
          setActiveDeck(prev => prev.map(g => g?.instanceId === targetGenerator.instanceId ? updatedGenerator : g));
        } else {
          setOwnedGenerators(prev => prev.map(g => g.instanceId === targetGenerator.instanceId ? updatedGenerator : g));
        }

        // Reduce use by 1 and remove if uses reach 0
        const updatedStorage = { ...generator, uses: generator.uses - 1 };
        if (updatedStorage.uses > 0) {
          setOwnedGenerators(prev => prev.map(g => g.instanceId === generator.instanceId ? updatedStorage : g));
          setActiveDeck(prev => prev.map(g => g?.instanceId === generator.instanceId ? updatedStorage : g));
        } else {
          setOwnedGenerators(prev => prev.filter(g => g.instanceId !== generator.instanceId));
          setActiveDeck(prev => prev.map(g => g?.instanceId === generator.instanceId ? null : g));
        }

        // Add a visual effect to the protected card
        const element = document.querySelector(`[data-instance-id="${targetGenerator.instanceId}"]`);
        if (element) {
          element.classList.add('protected');
          setTimeout(() => element.classList.remove('protected'), 1000);
        }
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

    // Add new conditions for omniscience and omnipotence
  if (generator.id === 'omniscience' || generator.id === 'omnipotence') {
    const targetGenerator = target === 'active' ? activeDeck[index] : ownedGenerators[index];
    if (targetGenerator) {
      handleOmniscienceOmnipotence(generator, targetGenerator);
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
        if (targetGenerator && (targetGenerator.id === generator.id || targetGenerator.id === 'fallenAngel' || targetGenerator.id === 'demonLord')) {
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
      if (targetGenerator && (targetGenerator.id === generator.id || targetGenerator.id === 'fallenAngel' || targetGenerator.id === 'demonLord') && !targetGenerator.isLocked) {
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

  const createCookieGoddess = () => {
    const cookieGoddess = GENERATOR_POOL.find(gen => gen.id === 'cookieGoddess');
    if (!cookieGoddess) {
      console.error('Cookie Goddess not found in GENERATOR_POOL');
      return;
    }
  
    const newGoddess: GeneratorInstance = {
      ...cookieGoddess,
      instanceId: uuidv4(),
      enhancements: 0,
      currentCps: cookieGoddess.cps,
      isLocked: false,
      foilType: 'phantom', // Always create as phantom foil
      uses: 1,
      boosts: 0,
      resetProtected: false
    };
  
    // Remove Omniscience and Omnipotence from both ownedGenerators and activeDeck
    setOwnedGenerators(prev => 
      [...prev.filter(g => g.id !== 'omniscience' && g.id !== 'omnipotence'), newGoddess]
    );
  
    setActiveDeck(prev => 
      prev.map(g => {
        if (g?.id === 'omniscience' || g?.id === 'omnipotence') {
          return null;
        }
        return g;
      })
    );
  };

  const handleOmniscienceOmnipotence = (source: GeneratorInstance, target: GeneratorInstance) => {
  if ((source.id === 'omniscience' && target.id === 'omnipotence') ||
      (source.id === 'omnipotence' && target.id === 'omniscience')) {
    createCookieGoddess();
    return;
  }

  let updatedTarget = { ...target };
  
  if (source.id === 'omniscience') {
    updatedTarget.critRate += 0.05; // Increase crit rate by 5%
    updatedTarget.critMultiplier += 0.25; // Increase crit multiplier by .25
  } else if (source.id === 'omnipotence') {
    updatedTarget.onClick *= 1.1; // Increase onClick value by 10%
  }

  
    setOwnedGenerators(prev => {
      return prev.map(g => {
        if (g.instanceId === target.instanceId) return updatedTarget;
        if (g.instanceId === source.instanceId) {
          return { ...g, uses: g.uses - 1 };
        }
        return g;
      }).filter(g => g.uses > 0);
    });
  
    setActiveDeck(prev => 
      prev.map(g => {
        if (g?.instanceId === target.instanceId) return updatedTarget;
        if (g?.instanceId === source.instanceId) {
          return source.uses > 1 ? { ...source, uses: source.uses - 1 } : null;
        }
        return g;
      })
    );

    // Add a visual effect to the updated card
    const element = document.querySelector(`[data-instance-id="${updatedTarget.instanceId}"]`);
    if (element) {
      element.classList.add('enhanced');
      setTimeout(() => element.classList.remove('enhanced'), 1000);
    }
  };

  const toggleAutoEvolve = () => {
    setAutoEvolveEnabled(prev => !prev);
  };

  // Add this function to handle the card boost
  const handleBoost = (booster: GeneratorInstance, target: GeneratorInstance) => {
    if (target.boosts >= BOOST_LIMITS[target.rarity]) {
      alert(`This ${target.rarity} card has reached its maximum boost limit of ${BOOST_LIMITS[target.rarity]}.`);
      return;
    }
    
    const boostedCard = {
      ...target,
      boosts: target.boosts + 1
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
    const buffs = calculateBuffs(activeDeck);
    return activeDeck.reduce((acc, gen) => {
      if (gen) {
        const foilBonus = FOIL_BONUSES[gen.foilType];
        const baseValue = gen.currentCps * foilBonus * Math.pow(1.25, gen.boosts);
        return acc + (baseValue * buffs.cps);
      }
      return acc;
    }, 0);
  }, [activeDeck]);

  const handleClick = () => {
    const buffs = calculateBuffs(activeDeck);
    let cookiesGained = 0;
    let crit = false;

    activeDeck.forEach(gen => {
      if (gen) {
        const critRoll = Math.random();
        const buffedCritRate = gen.critRate + buffs.critRate + (buffs.luck*0.01);
        if (critRoll < buffedCritRate) {
          cookiesGained += gen.onClick * buffs.onClick * gen.critMultiplier * buffs.critMultiplier * Math.pow(1.25, gen.boosts);
          crit = true;
        } else {
          cookiesGained += gen.onClick * buffs.onClick * Math.pow(1.25, gen.boosts);
        }
      }
    });

    cookiesGained = Math.max(1, cookiesGained);
    setCookies(prevCookies => prevCookies + cookiesGained);
    
    // Generate random position within the cookie image
    const x = Math.random() * 200 - 100; // Assuming the cookie is 200px wide
    const y = Math.random() * 200 - 100; // Assuming the cookie is 200px tall
  
    // Add new floating number
    setFloatingNumbers(prev => [
      ...prev,
      { id: Date.now(), value: cookiesGained, x, y, crit }
    ]);
  
    // Remove the floating number after animation
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(num => num.id !== Date.now()));
    }, 2000); // Match this with the CSS animation duration
    checkAchievements();
  };

  const getRandomGenerator = (isHighLevel: boolean): GeneratorInstance => {
    const buffs = calculateBuffs(activeDeck);
    const rarityChances = isHighLevel ? HIGH_LEVEL_RARITY_CHANCES : LOW_LEVEL_RARITY_CHANCES;
    const rarityRoll = Math.random() * (1 + buffs.luck * 0.1); // Increase chance of better rarity
  
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
  
    const foilRoll = Math.random() * (1 + buffs.luck*0.1);
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
      currentCps: selectedGenerator.cps,
      onClick: selectedGenerator.onClick,
      isLocked: false,
      isOneTimeUse: selectedGenerator.isOneTimeUse,
      critRate: selectedGenerator.critRate,
      critMultiplier: selectedGenerator.critMultiplier,
      set: selectedGenerator.set,
      foilType,
      uses: 1,
      boosts: 0,
      resetProtected: false
    };
  };

  const closeAnimation = () => {
    setIsRolling(false);
    setIsRevealing(false);
    setRevealedCards([]);
  };

  const rollGenerator = (count: number = 1, isHighLevel: boolean = false) => {
    if (isHighLevel) {
      const cost = count === 1 ? 1 : 8;
      if (mysticalCookies >= cost && ownedGenerators.length + count <= MAX_INVENTORY_SIZE && !isSpinning) {
        setMysticalCookies(prev => prev - cost);
        setLastRollType('high');
        
        // Generate new generators
        const newGenerators = Array(count).fill(null).map(() => getRandomGenerator(true));
        
        if (count === 1) {
          setIsSpinning(true);
          // Single roll: Use spin animation
          const totalItems = 50;
          const visibleItems = 5;
          const spinItems = Array(totalItems).fill(null).map(() => getRandomGenerator(true));
          
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
    } else {
      if (cookies >= lowLevelRollCost * count && ownedGenerators.length + count <= MAX_INVENTORY_SIZE && !isSpinning) {
        setCookies(prevCookies => prevCookies - lowLevelRollCost * count);
        setLowLevelRollCount(prev => prev + 1);
        setLowLevelRollCost(prev => Math.round(prev * 1.05)); // Increase cost by 5%
        setLastRollType('low');

        // Generate new generators
        const newGenerators = Array(count).fill(null).map(() => getRandomGenerator(false));
        
        // Multi-roll: Use reveal animation
        setRevealedCards(newGenerators)
        setIsRevealing(true);
  
        setOwnedGenerators(prevGenerators => [...prevGenerators, ...newGenerators]);
      }
    }
    checkAchievements();
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
    setSelectedGenerator({ ...generator, isLocked: generator.isLocked || false });
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

  // const updateGeneratorInState = (updatedGenerator: GeneratorInstance) => {
  //   setOwnedGenerators(prev => 
  //     prev.map(g => g.instanceId === updatedGenerator.instanceId ? updatedGenerator : g)
  //   );
  //   setActiveDeck(prev => 
  //     prev.map(g => g?.instanceId === updatedGenerator.instanceId ? updatedGenerator : g)
  //   );
  
  //   // Remove the generator if it has no more uses
  //   if (updatedGenerator.uses <= 0) {
  //     setOwnedGenerators(prev => prev.filter(g => g.instanceId !== updatedGenerator.instanceId));
  //     setActiveDeck(prev => prev.map(g => g?.instanceId === updatedGenerator.instanceId ? null : g));
  //   }
  // };

  // const useOneTimeCard = (generator: GeneratorInstance) => {
  //   if (generator.id === 'coinflip') {
  //     setSelectedCoinflipCard(generator);
  //     setShowWagerInput(true);

  //     // Decrease the number of uses
  //     const updatedGenerator = { ...generator, uses: generator.uses - 1 };
  //     updateGeneratorInState(updatedGenerator);
  //   }
  // };

  const handleWagerSubmit = () => {
    const amount = parseInt(wagerAmount);
    if (isNaN(amount) || amount <= 0 || amount > cookies) {
      alert("Invalid wager amount. Please enter a valid number of cookies.");
      return;
    }

    setShowWagerInput(false);
    setIsFlipping(true);
    setShowResult(false);
    
    const buffs = calculateBuffs(activeDeck);
    const randomValue = Math.random() + FOIL_CHANCE_BUFFS[selectedCoinflipCard?.foilType || 'normal'] + (buffs.luck * 0.05);
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

  const checkAchievements = () => {
    setAchievements(prevAchievements => {
      const newAchievements = [...prevAchievements];
      let changed = false;

      // Check cookie milestones
      const cookieMilestones = [100, 100000, 1000000, 1000000000, 1000000000000];
      cookieMilestones.forEach((milestone) => {
        const achievement = newAchievements.find((a) => a.id === `cookies_${milestone}`);
        if (achievement && !achievement.achieved && cookies >= milestone) {
          achievement.achieved = true;
          changed = true;
        }
      });

      // Check for first roll achievement
      const firstRollAchievement = newAchievements.find((a) => a.id === 'first_roll');
      if (firstRollAchievement && !firstRollAchievement.achieved && ownedGenerators.length > 0) {
        firstRollAchievement.achieved = true;
        changed = true;
      }

      // Check for rarity achievements
      const rarityAchievements = {
        uncommon: 'first_uncommon',
        rare: 'first_rare',
        epic: 'first_epic',
        legendary: 'first_legendary',
        mythical: 'first_mythical',
      };

      Object.entries(rarityAchievements).forEach(([rarity, achievementId]) => {
        const achievement = newAchievements.find((a) => a.id === achievementId);
        if (achievement && !achievement.achieved && ownedGenerators.some((g) => g.rarity === rarity)) {
          achievement.achieved = true;
          changed = true;
        }
      });

      return changed ? newAchievements : prevAchievements;
    });
  };

  const claimAchievementReward = (id: string) => {
    const achievement = achievements.find((a) => a.id === id);
    if (achievement && achievement.achieved && !achievement.redeemed) {
      setMysticalCookies((prev) => prev + achievement.reward);
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, redeemed: true } : a))
      );
    }
  };

  const toggleAchievements = () => {
    setShowAchievements(!showAchievements);
  };

  const calculatePrestigeReward = (cookies: number): number => {
    if (cookies < 1000000) return 0;
    return Math.floor(Math.pow(cookies / 1000000, 0.5));
  };

  const handlePrestige = () => {
    const prestigeReward = calculatePrestigeReward(cookies);
    if (prestigeReward === 0) {
      alert("You need at least 1,000,000 cookies to prestige!");
      return;
    }

    if (window.confirm(`Are you sure you want to prestige? You will gain ${prestigeReward} Mystical Cookies, but reset your progress.`)) {
      // Add Mystical Cookies
      setMysticalCookies(prevMystical => prevMystical + prestigeReward);

      // Reset cookies
      setCookies(0);

      // Filter out non-protected generators
      const protectedGenerators = ownedGenerators.filter(gen => gen.resetProtected);
      setOwnedGenerators(protectedGenerators);

      // Reset active deck, keeping only protected generators
      setActiveDeck(prevDeck => prevDeck.map(gen => gen?.resetProtected ? gen : null));

      // Reset other game states
      setLastRolledGenerator(null);
      setSelectedGenerator(null);
      setActiveSlots(1);

      // Reset achievements that are not one-time
      setAchievements(prevAchievements => 
        prevAchievements.map(achievement => 
          achievement.id.startsWith('first_') ? achievement : { ...achievement, achieved: false, redeemed: false }
        )
      );

      // You may want to reset or adjust other game states here
    }
  };

  // Functions end

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

  const calculateClickValue = () => {
    const baseClickValue = 0; // Base value for a click
    const buffs = calculateBuffs(activeDeck);
    
    // Calculate the total onClick value from active generators
    const totalOnClick = activeDeck.reduce((total, generator) => {
      if (generator) {
        return total + (generator.onClick * buffs.onClick * Math.pow(1.25, generator.boosts));
      }
      return total;
    }, baseClickValue);

    return totalOnClick;
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
            onClick: targetGenerator.onClick * 2, // Double the OnClick
            level: targetGenerator.level + 1,
            enhancements: 0, // Reset enhancements after evolution
            boosts: Math.max(targetGenerator.boosts, enhancerGenerator.boosts)
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
        enhancedGenerator.boosts = Math.max(targetGenerator.boosts, enhancerGenerator.boosts);

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

  const renderBuffInfo = () => {
    const buffs = calculateBuffs(activeDeck);
    const activeSetBonuses = SET_BONUSES.filter(setBonus => 
      activeDeck.filter(card => card?.set === setBonus.setName).length >= setBonus.requiredCards
    );

    return (
      <div className="buff-info">
        {(buffs.cps !== 1 || buffs.critRate !== 0 || buffs.critMultiplier !== 1 || buffs.onClick !== 1 || buffs.sacrificeMultiplier !== 1 || buffs.luck !== 0) && (
          <h4>Active Buffs:</h4>
        )}
        <p>
          {buffs.cps !== 1 && `CPS Multiplier: x${buffs.cps.toFixed(2)}`}
          {buffs.critRate !== 0 && ` Crit Rate: +${(buffs.critRate * 100).toFixed(2)}%`}
          {buffs.critMultiplier !== 1 && ` Crit Multiplier: x${buffs.critMultiplier.toFixed(2)}`}
          {buffs.onClick !== 1 && ` On Click Multiplier: x${buffs.onClick.toFixed(2)}`}
          {buffs.sacrificeMultiplier !== 1 && ` Sacrifice Multiplier: x${buffs.sacrificeMultiplier.toFixed(2)}`}
          {buffs.luck !== 0 && ` Luck: x${buffs.luck.toFixed(2)}`}
        </p>
        {activeSetBonuses.length > 0 && (
          <>
            <h4>Active Set Bonuses:</h4>
            <p>{activeSetBonuses.map(setBonus => setBonus.setName).join(', ')}</p>
          </>
        )}
      </div>
    );
  };

  const renderStats = () => (
    <div className="stats">
      <p>Cookies: {formatNumber(cookies)}</p>
      <p>Mystical Cookies: {mysticalCookies}</p>
      <p>Per second: {formatNumber(totalCPS)}</p>
      <p>Per click: {formatNumber(calculateClickValue())}</p>
    </div>
  );

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
          <span>{formatNumber(generator.currentCps * FOIL_BONUSES[generator.foilType] * Math.pow(1.25, generator.boosts))} CPS</span>
        )}
        {generator.level > 1 && <span>LVL {generator.level}</span>}
        {generator.isOneTimeUse && <span>Uses: {generator.uses}</span>} 
      </div>
    </div>
  );

  return (
    <div className="App">
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
              {num.crit ? <span className="crit">CRIT!</span> : null}
              +{formatNumber(num.value)}
          </div>
        ))}
      </div>
          <div className="stats">
            {renderStats()}
          </div>
          <div className="game-controls">
          <button className="shop-button" onClick={toggleShop}>
            <FaStore /> Shop
          </button>
          <button className="achievements-button" onClick={toggleAchievements}>
            <FaTrophy /> Achievements
          </button>
          <button onClick={confirmReset} className="reset-button">
            Reset Game
          </button>

          <button onClick={handlePrestige} className="prestige-button">
            <FaRedo /> Prestige
          </button> 
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
          </div>

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
        {renderBuffInfo()}
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

      {showAchievements && (
        <Achievements 
          achievements={achievements} 
          onClaimReward={claimAchievementReward} 
          onClose={toggleAchievements}
        />
      )}
      {isShopOpen && (
        <div className="shop-overlay">
          <div className="shop-content">
            <h2>Generator Shop</h2>
            <button className="close-shop" onClick={toggleShop}>&times;</button>

            <div className="roll-buttons">
              <button 
                onClick={() => rollGenerator(MULTI_ROLL_COUNT, false)} 
                disabled={cookies < lowLevelRollCost * MULTI_ROLL_COUNT || isRolling || ownedGenerators.length > MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT}
              >
                Low Level Multi-Roll (Cost: {formatNumber(lowLevelRollCost * MULTI_ROLL_COUNT)} cookies)
              </button>
              <button 
                onClick={() => rollGenerator(1, true)} 
                disabled={mysticalCookies < 1 || isRolling || ownedGenerators.length >= MAX_INVENTORY_SIZE}
              >
                High Level Single Roll (Cost: 1 Mystical Cookie)
              </button>
              <button 
                onClick={() => rollGenerator(MULTI_ROLL_COUNT, true)} 
                disabled={mysticalCookies < 8 || isRolling || ownedGenerators.length > MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT}
              >
                High Level Multi-Roll (Cost: 8 Mystical Cookies)
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
                                animationDelay: `${index * 0.05}s`
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
                          onClick={handleRollAgain} 
                          disabled={isRolling || 
                            (lastRollType === 'high' ? mysticalCookies < 8 : cookies < lowLevelRollCost * MULTI_ROLL_COUNT) || 
                            ownedGenerators.length > MAX_INVENTORY_SIZE - MULTI_ROLL_COUNT}
                        >
                          Roll Again (Cost: {lastRollType === 'high' ? '8 Mystical Cookies' : `${formatNumber(lowLevelRollCost * MULTI_ROLL_COUNT)} cookies`})
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
            <p>Level: {selectedGenerator.level} | CPS: {formatNumber(selectedGenerator.currentCps * FOIL_BONUSES[selectedGenerator.foilType] * Math.pow(1.25, selectedGenerator.boosts))} | {selectedGenerator.rarity}</p>
            <p>On Click: {formatNumber(selectedGenerator.onClick * FOIL_BONUSES[selectedGenerator.foilType] * Math.pow(1.25, selectedGenerator.boosts))} | Crit %: {(selectedGenerator.critRate * 100).toFixed(2)}% | Crit Multiplier: {selectedGenerator.critMultiplier.toFixed(2)}x</p>
            <p>Boosts: {selectedGenerator.boosts}/{BOOST_LIMITS[selectedGenerator.rarity]}</p>
            {selectedGenerator.enhancements > 0 && <p>Enhancement Level: {Math.round(selectedGenerator.enhancements)}/{Math.pow(5, selectedGenerator.level)}</p>}
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