/**
 * Unified duration probability distribution strategy.
 * Returns a duration between min and max, skewed by intensity.
 *
 * The logic assumes "Escalation" (Positive Correlation):
 * - Low Intensity: Skewed towards `min`.
 * - High Intensity: Uniform distribution (average between `min` and `max`).
 *
 * To achieve "Pressure" (Negative Correlation), simply swap `min` and `max` in the call.
 * - `getWeightedDuration(min, max, int)` -> Starts at `min`, grows to average.
 * - `getWeightedDuration(max, min, int)` -> Starts at `max`, shrinks to average.
 *
 * @param min Start duration in milliseconds (usually minimum, but can be maximum for inverse logic)
 * @param max End duration in milliseconds
 * @param intensity Current game intensity (0-100)
 */
export const getWeightedDuration = (
  min: number,
  max: number,
  intensity: number
): number => {
  // Normalize intensity to 0-1
  const n = intensity / 100;
  
  // Calculate skew factor. 
  // We use a fixed "Escalation" curve:
  // - Intensity 0 (n=0) -> Skew 3 (Bias towards 'min')
  // - Intensity 100 (n=1) -> Skew 1 (Uniform)
  const skew = 3 - n * 2;
  
  const randomSkewed = Math.pow(Math.random(), skew);
  
  return Math.floor(min + (max - min) * randomSkewed);
};
