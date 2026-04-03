/**
 * Real US Currency Image Loader
 * Loads actual currency photos for use in worksheets
 */

// Currency image paths
const CURRENCY_PATHS = {
  bills: {
    1: '/assets/currency/dollar_1.png',
    5: '/assets/currency/dollar_5.png',
    10: '/assets/currency/dollar_10.png',
    20: '/assets/currency/dollar_20.png',
  },
  coins: {
    dollar: '/assets/currency/coin_dollar.png',
    quarter: '/assets/currency/coin_quarter.png',
    dime: '/assets/currency/coin_dime.png',
    nickel: '/assets/currency/coin_nickel.png',
    penny: '/assets/currency/coin_penny.png',
  }
};

/**
 * Load image as base64 data URL
 */
async function loadImageAsBase64(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Image not found: ${path}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Failed to load currency image: ${path}`, error);
    return null;
  }
}

/**
 * Load all currency images
 */
export async function loadCurrencyImages() {
  const images = {
    bills: {},
    coins: {}
  };

  // Load bills
  for (const [value, path] of Object.entries(CURRENCY_PATHS.bills)) {
    const base64 = await loadImageAsBase64(path);
    if (base64) {
      images.bills[value] = base64;
    }
  }

  // Load coins
  for (const [name, path] of Object.entries(CURRENCY_PATHS.coins)) {
    const base64 = await loadImageAsBase64(path);
    if (base64) {
      images.coins[name] = base64;
    }
  }

  return images;
}

/**
 * Get bill image by denomination
 */
export function getBillImage(images, value) {
  if (!images || !images.bills) return null;

  // Find closest available bill
  if (value >= 20 && images.bills[20]) return images.bills[20];
  if (value >= 10 && images.bills[10]) return images.bills[10];
  if (value >= 5 && images.bills[5]) return images.bills[5];
  if (value >= 1 && images.bills[1]) return images.bills[1];

  return null;
}

/**
 * Get coin image by value
 */
export function getCoinImage(images, value) {
  if (!images || !images.coins) return null;

  const coinMap = {
    1.00: 'dollar',
    0.25: 'quarter',
    0.10: 'dime',
    0.05: 'nickel',
    0.01: 'penny'
  };

  const coinName = coinMap[value];
  return coinName ? images.coins[coinName] : null;
}

/**
 * Check if real images are available
 */
export function hasRealImages(images) {
  if (!images) return false;

  const hasBills = images.bills && Object.keys(images.bills).length > 0;
  const hasCoins = images.coins && Object.keys(images.coins).length > 0;

  return hasBills || hasCoins;
}

const currencyImageLoader = {
  loadCurrencyImages,
  getBillImage,
  getCoinImage,
  hasRealImages,
  CURRENCY_PATHS
};

export default currencyImageLoader;
