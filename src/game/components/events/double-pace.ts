import { GameEvent } from '../../../types';
import { getWeightedDuration, intensityToPace, round, wait } from '../../../utils';
import { GamePhase } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const doublePaceEvent = async (data: EventDataRef) => {
  const {
    game: { setPace, sendMessage, intensity, setPhase },
    settings: { maxPace, minPace, steepness, timeshift },
  } = data.current;
  const pace = data.current.game.pace;
  const newPace = Math.min(round(pace * 2), 12);
  
  setPhase(GamePhase.modifier);
  setPace(newPace);
  sendMessage({
    id: GameEvent.doublePace,
    title: 'Double pace!',
  });
  const duration = getWeightedDuration(5000, 15000, intensity, false);
  const durationPortion = duration / 3;
  sendMessage({
    id: GameEvent.doublePace,
    description: '3...',
  });
  await wait(durationPortion);
  sendMessage({
    id: GameEvent.doublePace,
    description: '2...',
  });
  await wait(durationPortion);
  sendMessage({
    id: GameEvent.doublePace,
    description: '1...',
  });
  await wait(durationPortion);

  // Restore to intensity-based pace (standard normal pace)
  const restorePace = round(intensityToPace(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  }));

  sendMessage({
    id: GameEvent.doublePace,
    title: `Done! Back to normal.`,
    description: undefined,
    duration: 5000,
  });

  setPace(restorePace);
  setPhase(GamePhase.active);
};
