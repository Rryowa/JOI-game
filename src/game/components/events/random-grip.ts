import { GameEvent } from '../../../types';
import { wait } from '../../../utils';
import { Paws, PawLabels } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const randomGripEvent = async (data: EventDataRef) => {
  const {
    game: { paws, setPaws, sendMessage },
  } = data.current;

  const choices = [Paws.base, Paws.tip, Paws.none].filter(p => p !== paws);
  const newPaws = choices[Math.floor(Math.random() * choices.length)];

  setPaws(newPaws);
  sendMessage({
    id: GameEvent.randomGrip,
    title: `WARNING! ${PawLabels[newPaws]}!`,
    duration: 5000,
  });
  await wait(10000);
};
