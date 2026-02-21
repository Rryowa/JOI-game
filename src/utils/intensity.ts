import { NumberRange } from './range';
import { polynomialRoot } from 'mathjs';

/**
 * Convert intensity to pace.
 * Thanks Oreo <3
 * https://www.desmos.com/calculator/y4fcreol4p
 */
export const intensityToPace = (
  intensity: number,
  steepness: number,
  timeshift: number,
  { min, max }: NumberRange
): number => {
  const x2 = 100 * Math.min(steepness * 2 * timeshift, 1);
  const x3 = 100 * Math.max(1 - 2 * steepness * (1 - timeshift), 0);
  const x4 = 100;

  const a = 3 * x2 - 3 * x3 + x4;
  const b = -6 * x2 + 3 * x3;
  const c = 3 * x2;

  const roots = polynomialRoot(-intensity, c, b, a);
  const t = roots
    .find((root): root is number | any => {
      const re = typeof root === 'number' ? root : (root as any).re;
      const im = typeof root === 'number' ? 0 : (root as any).im;
      return !isNaN(re) && Math.abs(im) < 0.01 && re >= -0.01 && re <= 1.01;
    });

  if (t === undefined) return min;

  const reT = typeof t === 'number' ? t : (t as any).re;
  const clampedT = Math.max(0, Math.min(1, reT));
  const y = 0.1 * clampedT + 0.9 * Math.pow(clampedT, 6);
  return y * (max - min) + min;
};

export const intensityToPaceRange = (
  intensity: number,
  steepness: number,
  timeshift: number,
  { min, max }: NumberRange
): NumberRange => {
  const pace = intensityToPace(intensity, steepness, timeshift, { min, max });
  return {
    min: Math.max(min, pace - 1.5),
    max: Math.min(max, pace + 1.5),
  };
};

/**
 * The [intensityToPace] function needs to reverse from a coordinate to a time.
 * For that reason, it is costly. We use this function for the graph instead.
 */
export const paceGraphPoint = (
  t: number,
  steepness: number,
  timeshift: number,
  { min, max }: NumberRange
): readonly [number, number] => {
  const x2 = 100 * Math.min(steepness * 2 * timeshift, 1);
  const x3 = 100 * Math.max(1 - 2 * steepness * (1 - timeshift), 0);
  const x4 = 100;

  const x =
    (3 * x2 - 3 * x3 + x4) * t * t * t +
    (-6 * x2 + 3 * x3) * t * t +
    3 * x2 * t;

  const y = 0.1 * t + 0.9 * Math.pow(t, 6);

  return [x, y * (max - min) + min] as const;
};
