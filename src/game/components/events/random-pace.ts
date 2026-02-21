import { GameEvent } from '../../../types';
import { getWeightedDuration, intensityToPace, intensityToPaceRange, round, wait } from '../../../utils';
import { GamePhase } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const randomPaceEvent = async (data: EventDataRef) => {
  const {
    game: { intensity, setPace, sendMessage, setPhase },
    settings: { minPace, maxPace, steepness, timeshift },
  } = data.current;

  setPhase(GamePhase.modifier);
  const { min, max } = intensityToPaceRange(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  });
  const newPace = round(Math.random() * (max - min) + min);
  setPace(newPace);
  sendMessage({
    id: GameEvent.randomPace,
    title: `Pace changed to ${newPace}!`,
    duration: 5000,
  });
  const duration = getWeightedDuration(5000, 15000, intensity, true);
  await wait(duration);

  const restorePace = round(intensityToPace(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  }));

  sendMessage({
    id: GameEvent.randomPace,
    title: `Back to normal BPM`,
    duration: 5000,
  });
  setPace(restorePace);
  setPhase(GamePhase.active);
};
