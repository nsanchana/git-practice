// Black-Scholes option pricing model implementation
// Based on the Black-Scholes formula for European options

// Standard normal cumulative distribution function
function normCDF(x) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2.0);

  const t = 1.0 / (1.0 + p * x);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * erf);
}

// Standard normal probability density function
function normPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Black-Scholes call option price
function blackScholesCall(S, K, T, r, sigma, q = 0) {
  if (T <= 0) return Math.max(S - K, 0);
  if (sigma <= 0) return Math.max(S - K, 0);

  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  return S * Math.exp(-q * T) * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
}

// Black-Scholes put option price
function blackScholesPut(S, K, T, r, sigma, q = 0) {
  if (T <= 0) return Math.max(K - S, 0);
  if (sigma <= 0) return Math.max(K - S, 0);

  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  return K * Math.exp(-r * T) * normCDF(-d2) - S * Math.exp(-q * T) * normCDF(-d1);
}

// Calculate option price
export function calculateOptionPrice(params) {
  const { currentPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, volatility: sigma, dividendYield: q, optionType } = params;

  // Convert time to years
  const timeInYears = T / 365;

  if (optionType === 'call') {
    return blackScholesCall(S, K, timeInYears, r, sigma, q);
  } else {
    return blackScholesPut(S, K, timeInYears, r, sigma, q);
  }
}

// Calculate option Greeks
export function calculateGreeks(params) {
  const { currentPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, volatility: sigma, dividendYield: q, optionType } = params;

  // Convert time to years
  const timeInYears = T / 365;

  if (timeInYears <= 0 || sigma <= 0) {
    return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }

  const sqrtT = Math.sqrt(timeInYears);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * timeInYears) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  let delta, gamma, theta, vega, rho;

  if (optionType === 'call') {
    delta = Math.exp(-q * timeInYears) * normCDF(d1);
    gamma = Math.exp(-q * timeInYears) * normPDF(d1) / (S * sigma * sqrtT);
    theta = (-S * sigma * Math.exp(-q * timeInYears) * normPDF(d1) / (2 * sqrtT)
             - r * K * Math.exp(-r * timeInYears) * normCDF(d2)
             + q * S * Math.exp(-q * timeInYears) * normCDF(d1)) / 365;
    vega = S * Math.exp(-q * timeInYears) * normPDF(d1) * sqrtT / 100;
    rho = K * timeInYears * Math.exp(-r * timeInYears) * normCDF(d2) / 100;
  } else {
    delta = -Math.exp(-q * timeInYears) * normCDF(-d1);
    gamma = Math.exp(-q * timeInYears) * normPDF(d1) / (S * sigma * sqrtT);
    theta = (-S * sigma * Math.exp(-q * timeInYears) * normPDF(d1) / (2 * sqrtT)
             + r * K * Math.exp(-r * timeInYears) * normCDF(-d2)
             - q * S * Math.exp(-q * timeInYears) * normCDF(-d1)) / 365;
    vega = S * Math.exp(-q * timeInYears) * normPDF(d1) * sqrtT / 100;
    rho = -K * timeInYears * Math.exp(-r * timeInYears) * normCDF(-d2) / 100;
  }

  return { delta, gamma, theta, vega, rho };
}

// Calculate implied volatility using Newton-Raphson method
export function calculateImpliedVolatility(params, marketPrice, tolerance = 0.0001, maxIterations = 100) {
  const { currentPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, dividendYield: q, optionType } = params;
  const timeInYears = T / 365;

  let sigma = 0.2; // Initial guess
  let iteration = 0;

  while (iteration < maxIterations) {
    const price = optionType === 'call'
      ? blackScholesCall(S, K, timeInYears, r, sigma, q)
      : blackScholesPut(S, K, timeInYears, r, sigma, q);

    const diff = price - marketPrice;
    if (Math.abs(diff) < tolerance) {
      return sigma;
    }

    // Calculate vega for derivative
    const greeks = calculateGreeks({ ...params, volatility: sigma });
    const vega = greeks.vega * 100; // Convert back from percentage

    if (vega === 0) break;

    sigma = sigma - diff / vega;
    sigma = Math.max(0.001, Math.min(5.0, sigma)); // Clamp to reasonable range

    iteration++;
  }

  return sigma; // Return best estimate even if not converged
}