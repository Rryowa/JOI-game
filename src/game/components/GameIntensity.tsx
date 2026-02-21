import { useSetting } from '../../settings';
import { intensityToPace, useLooping } from '../../utils';
import { GamePhase, useGameValue } from '../GameProvider';

export const GameIntensity = () => {
  const [, setIntensity] = useGameValue('intensity');
  const [intensity] = useGameValue('intensity');
  const [pace] = useGameValue('pace');
  const [phase] = useGameValue('phase');
  
  const [duration] = useSetting('gameDuration');
  const [minPace] = useSetting('minPace');
  const [maxPace] = useSetting('maxPace');
  const [steepness] = useSetting('steepness');
  const [timeshift] = useSetting('timeshift');

  useLooping(
    () => {
      // Base progression rate: how much intensity increases per second normally
      const baseDelta = 100 / duration;

      // Calculate what the "normal" pace should be for this intensity
      const normalPace = intensityToPace(intensity, steepness, timeshift, {
        min: minPace,
        max: maxPace,
      });

      // Scaling factor: if we are going faster than normal, progress faster.
      // If we are paused (pace 0), progression stops.
      const multiplier = normalPace > 0 ? pace / normalPace : 0;
      
      // Apply the scaled delta
      setIntensity(prev => Math.min(prev + baseDelta * multiplier, 100));
    },
    1000, // Tick every second
    [GamePhase.active, GamePhase.modifier, GamePhase.interruption].includes(phase)
  );

  return null;
};
