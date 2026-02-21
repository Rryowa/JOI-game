/**
 * Unified duration probability distribution strategy.
 * Returns a duration between min and max, skewed by intensity.
 * 
 * @param min Minimum duration in milliseconds
 * @param max Maximum duration in milliseconds
 * @param intensity Current game intensity (0-100)
 * @param reverse If true, higher intensity leads to shorter durations
 */
export const getWeightedDuration = (
  min: number,
  max: number,
  intensity: number,
  reverse: boolean = false
): number => {
  // Normalize intensity to 0-1
  const n = intensity / 100;
  
  // Calculate skew factor. 
  // If reverse is true, higher intensity makes the 'random' value smaller on average.
  // We use a power function to skew the distribution.
  const skew = reverse ? 1 + n * 2 : 3 - n * 2;
  
  const randomSkewed = Math.pow(Math.random(), skew);
  
  return Math.floor(min + (max - min) * randomSkewed);
};
