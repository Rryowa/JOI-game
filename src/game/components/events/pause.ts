import { GameEvent } from '../../../types';
import { getWeightedDuration, intensityToPace, round, wait } from '../../../utils';
import { GamePhase } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const pauseEvent = async (data: EventDataRef) => {
  const {
    game: { intensity, setPhase, sendMessage, setPace },
    settings: { minPace, maxPace, steepness, timeshift },
  } = data.current;

  sendMessage({
    id: GameEvent.pause,
    title: 'Stop stroking!',
  });
  setPhase(GamePhase.pause);
  const duration = getWeightedDuration(40000, 10000, intensity);
  await wait(duration);

  const restorePace = round(intensityToPace(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  }));

  sendMessage({
    id: GameEvent.pause,
    title: `Start stroking again, slave!)`,
    duration: 5000,
  });
  setPace(restorePace);
  setPhase(GamePhase.active);
};
