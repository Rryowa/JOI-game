import { useEffect } from 'react';
import { GamePhase, useGameValue } from '../GameProvider';
import { useSetting } from '../../settings';
import { intensityToPace, round } from '../../utils';

export const GamePace = () => {
  const [minPace] = useSetting('minPace');
  const [maxPace] = useSetting('maxPace');
  const [steepness] = useSetting('steepness');
  const [timeshift] = useSetting('timeshift');

  const [phase] = useGameValue('phase');
  const [intensity] = useGameValue('intensity');
  const [, setPace] = useGameValue('pace');

  useEffect(() => {
    if (phase !== GamePhase.active && phase !== GamePhase.finale) return;

    const nextPace = round(
      intensityToPace(intensity, steepness, timeshift, {
        min: minPace,
        max: maxPace,
      })
    );
    setPace(nextPace);
  }, [phase, intensity, minPace, maxPace, steepness, timeshift, setPace]);

  return null;
};
