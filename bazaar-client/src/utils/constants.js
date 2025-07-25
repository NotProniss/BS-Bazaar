// Currency images
import platinumImg from '../assets/Platinum.png';
import goldImg from '../assets/Gold.png';
import silverImg from '../assets/Silver.png';
import copperImg from '../assets/Copper.png';

// Profession images
import alchemistImg from '../assets/Alchemist.png';
import armorerImg from '../assets/Armorer.png';
import blacksmithImg from '../assets/Blacksmith.png';
import bonewrightImg from '../assets/Bonewright.png';
import builderImg from '../assets/Builder.png';
import carpenterImg from '../assets/Carpenter.png';
import chefImg from '../assets/Chef.png';
import combatImg from '../assets/Combat.png';
import delverImg from '../assets/Delver.png';
import detectiveImg from '../assets/Detective.png';
import fisherImg from '../assets/Fisher.png';
import foragerImg from '../assets/Forager.png';
import gathererImg from '../assets/Gatherer.png';
import guardianImg from '../assets/Guardian.png';
import hammermageImg from '../assets/Hammermage.png';
import leatherworkerImg from '../assets/Leatherworker.png';
import merchantImg from '../assets/Merchant.png';
import minerImg from '../assets/Miner.png';
import stonemasonImg from '../assets/Stonemason.png';
import woodcutterImg from '../assets/Woodcutter.png';
import cryoknightImg from '../assets/Cryoknight.png';

// Episode images
import hopeportImg from '../assets/Hopeport.png';
import hopeforestImg from '../assets/Hopeforest.png';
import mineOfMantubanImg from '../assets/Mine_of_Mantuban.png';
import crenopolisImg from '../assets/Crenopolis.png';
import stonemawHillImg from '../assets/Stonemaw_Hill.png';

// Damage type images
import impactImg from '../assets/Impact.png';
import cryonaeImg from '../assets/Cryonae.png';
import arboraeImg from '../assets/Arborae.png';
import tempestaeImg from '../assets/Tempestae.png';
import infernaeImg from '../assets/Infernae.png';
import necromaeImg from '../assets/Necromae.png';

// Items data

// Dynamic item data fetcher
export async function fetchItemData() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${BACKEND_URL}/api/items`);
    if (!res.ok) throw new Error('Failed to fetch item data');
    return await res.json();
  } catch (err) {
    console.error('Error fetching item data:', err);
    return [];
  }
}

export const currencyImages = {
  platinum: platinumImg,
  gold: goldImg,
  silver: silverImg,
  copper: copperImg
};

export const professionImages = {
  Alchemist: alchemistImg,
  Armorer: armorerImg,
  Blacksmith: blacksmithImg,
  Bonewright: bonewrightImg,
  Builder: builderImg,
  Carpenter: carpenterImg,
  Chef: chefImg,
  Combat: combatImg,
  Delver: delverImg,
  Detective: detectiveImg,
  Fisher: fisherImg,
  Forager: foragerImg,
  Gatherer: gathererImg,
  Guardian: guardianImg,
  Hammermage: hammermageImg,
  Leatherworker: leatherworkerImg,
  Merchant: merchantImg,
  Miner: minerImg,
  Stonemason: stonemasonImg,
  Woodcutter: woodcutterImg,
  Cryoknight: cryoknightImg
};

export const episodeImages = {
  Hopeport: hopeportImg,
  Hopeforest: hopeforestImg,
  "Mine of Mantuban": mineOfMantubanImg,
  Crenopolis: crenopolisImg,
  "Stonemaw Hill": stonemawHillImg
};

export const dmgTypeImages = {
  Impact: impactImg,
  Cryonae: cryonaeImg,
  Arborae: arboraeImg,
  Tempestae: tempestaeImg,
  Infernae: infernaeImg,
  Necromae: necromaeImg
};

// Removed export { itemData } since itemData is no longer defined

export const CURRENCY_MULTIPLIERS = {
  platinum: 1000000000,
  gold: 1000000,
  silver: 1000,
  copper: 1
};
