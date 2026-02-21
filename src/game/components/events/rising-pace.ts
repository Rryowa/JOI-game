import { GameEvent } from '../../../types';
import { intensityToPace, intensityToPaceRange, wait, round } from '../../../utils';
import { GamePhase } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const risingPaceEvent = async (data: EventDataRef) => {
  const {
    game: { intensity, setPace, sendMessage, setPhase },
    settings: { minPace, maxPace, steepness, timeshift },
  } = data.current;

  setPhase(GamePhase.modifier);
  sendMessage({
    id: GameEvent.risingPace,
    title: 'Rising pace strokes!',
  });
  const acceleration = Math.round(100 / Math.min(intensity, 35));
  const { max } = intensityToPaceRange(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  });
  const currentPace = data.current.game.pace;
  const targetMax = Math.max(max, currentPace + 1);
  const portion = (targetMax - currentPace) / acceleration;
  let newPace = currentPace;
  for (let i = 0; i < acceleration; i++) {
    await wait(10000);
    newPace = round(newPace + portion);
    setPace(newPace);
    sendMessage({
      id: GameEvent.risingPace,
      title: `Pace rising to ${newPace}!`,
      duration: 5000,
    });
  }
  await wait(10000);
  sendMessage({
    id: GameEvent.risingPace,
    title: 'Stay at this pace for a bit',
    duration: 5000,
  });
  await wait(15000);

  const restorePace = round(intensityToPace(intensity, steepness, timeshift, {
    min: minPace,
    max: maxPace,
  }));

  sendMessage({
    id: GameEvent.risingPace,
    title: `Back to normal BPM`,
    duration: 5000,
  });
  setPace(restorePace);
  setPhase(GamePhase.active);
};
