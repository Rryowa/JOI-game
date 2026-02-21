import { GameEvent } from '../../../types';
import { getWeightedDuration, wait } from '../../../utils';
import { GamePhase } from '../../GameProvider';
import { EventDataRef } from '../GameEvents';

export const climaxEvent = async (data: EventDataRef) => {
  const {
    game: { setPhase, sendMessage, setIntensity },
    settings: { climaxChance, ruinChance },
  } = data.current;

  setPhase(GamePhase.finale); // this disables events

  const duration = getWeightedDuration(5000, 30000, 100, true);
  const countdownSeconds = Math.floor(duration / 1000);
  for (let i = countdownSeconds; i > 0; i--) {
    sendMessage({
      id: GameEvent.climax,
      title: 'Stay on the edge!',
      description: `${i}...`,
    });
    await wait(1000);
  }

  if (Math.random() * 100 <= climaxChance) {
    if (Math.random() * 100 <= ruinChance) {
      setPhase(GamePhase.pause);
      sendMessage({
        id: GameEvent.climax,
        title: '$HANDS OFF! Ruin your orgasm!',
        description: undefined,
      });
      await wait(3000);
      sendMessage({
        id: GameEvent.climax,
        title: 'Clench in desperation',
      });
    } else {
      setPhase(GamePhase.climax);
      sendMessage({
        id: GameEvent.climax,
        title: 'Cum!',
        description: undefined,
      });
    }
    for (let i = 0; i < 10; i++) {
      setIntensity(intensity => intensity - 10);
      await wait(1000);
    }
    sendMessage({
      id: GameEvent.climax,
      title: 'Good job, $player',
      prompts: [
        {
          title: 'Leave',
          onClick: () => {
            window.location.href = '/';
          },
        },
      ],
    });
  } else {
    setPhase(GamePhase.pause);
    sendMessage({
      id: GameEvent.climax,
      title: '$HANDS OFF! Do not cum!',
      description: undefined,
    });
    for (let i = 0; i < 5; i++) {
      setIntensity(intensity => intensity - 20);
      await wait(1000);
    }
    sendMessage({
      id: GameEvent.climax,
      title: 'Good $player. Let yourself cool off',
    });
    await wait(5000);
    sendMessage({
      id: GameEvent.climax,
      title: 'Leave now.',
      prompts: [
        {
          title: 'Leave',
          onClick: () => {
            window.location.href = '/';
          },
        },
      ],
    });
  }
};
