import { GameEvent } from '../../../types';
import { getWeightedDuration, intensityToPace, round, wait } from '../../../utils';
import { GamePhase } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const halfPaceEvent = async (data: EventDataRef) => {
  const {
    game: { pace, setPace, sendMessage, intensity, setPhase },
    settings: { minPace, maxPace, steepness, timeshift },
  } = data.current;

  setPhase(GamePhase.interruption);
  sendMessage({
    id: GameEvent.halfPace,
    title: 'Half pace!',
  });
  const newPace = Math.max(round(pace / 2), minPace);
  setPace(newPace);
  const duration = getWeightedDuration(30000, 10000, intensity);
  const durationPortion = duration / 3;
  sendMessage({
    id: GameEvent.halfPace,
    description: '3...',
  });
  await wait(durationPortion);
  sendMessage({
    id: GameEvent.halfPace,
    description: '2...',
  });
  await wait(durationPortion);
  sendMessage({
    id: GameEvent.halfPace,
    description: '1...',
  });
  await wait(durationPortion);

  const restorePace = round(intensityToPace(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  }));

  sendMessage({
    id: GameEvent.halfPace,
    title: `Back to normal BPM`,
    description: undefined,
    duration: 5000,
  });

  setPace(restorePace);
  setPhase(GamePhase.active);
};
