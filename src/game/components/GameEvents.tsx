/* eslint-disable react-refresh/only-export-components */
import { MutableRefObject, useEffect, useRef } from 'react';
import { GameEvent } from '../../types';
import {
  GamePhase,
  GameState,
  useGame,
  useGameValue,
  useSendMessage,
} from '../GameProvider';
import { Settings, useSettings } from '../../settings';
import {
  useLooping,
  useAutoRef,
  createStateSetters,
  StateWithSetters,
} from '../../utils';
import {
  climaxEvent,
  doublePaceEvent,
  halfPaceEvent,
  pauseEvent,
  randomGripEvent,
  randomPaceEvent,
  risingPaceEvent,
} from './events';

export interface EventData {
  game: StateWithSetters<GameState> & {
    sendMessage: ReturnType<typeof useSendMessage>;
  };
  settings: StateWithSetters<Settings>;
}

export type EventDataRef = MutableRefObject<EventData>;

// D = Dead-time (cooldown) in seconds
const EVENT_COOLDOWN = 15;

/**
 * Main Event Rate Configuration (Affects Pace/Phase)
 */
const MAIN_EVENT_CONFIG: Partial<Record<
  GameEvent,
  { base: number; scale: number; category: 'interruption' | 'modifier' }
>> = {
  [GameEvent.pause]: { base: 0.01, scale: 0.01, category: 'interruption' },
  [GameEvent.halfPace]: { base: 0.01, scale: 0.01, category: 'interruption' },
  [GameEvent.randomPace]: { base: 0.01, scale: 0.02, category: 'interruption' },
  [GameEvent.doublePace]: { base: 0.01, scale: 0.03, category: 'modifier' },
  [GameEvent.risingPace]: { base: 0.01, scale: 0.01, category: 'modifier' },
};

/**
 * Visual Event Rate Configuration (Purely aesthetic, non-blocking)
 */
const VISUAL_EVENT_CONFIG: Partial<Record<
  GameEvent,
  { base: number; scale: number }
>> = {
  [GameEvent.randomGrip]: { base: 0.02, scale: 0.02 },
};

import { logger } from '../../utils/logger';

export const rollEventDice = (
  data: EventDataRef,
  config: typeof MAIN_EVENT_CONFIG | typeof VISUAL_EVENT_CONFIG,
  lastTimestampRef: MutableRefObject<number>,
  lastEventRef: MutableRefObject<GameEvent | null>,
  cooldown: number
) => {
  const {
    game: { intensity, phase },
    settings: { events },
  } = data.current;

  if (![GamePhase.active, GamePhase.modifier, GamePhase.interruption].includes(phase)) return null;

  // Climax check is only for the main loop
  if (config === MAIN_EVENT_CONFIG && events.includes(GameEvent.climax) && intensity >= 100) {
    logger.info('EventEngine', 'CLIMAX triggered at intensity 100');
    return GameEvent.climax;
  }

  // Cooldown Check
  const now = Date.now();
  if (now - lastTimestampRef.current < cooldown * 1000) {
    return null;
  }

  const dt = 1; // Loop runs every 1000ms
  const normalizedIntensity = intensity / 100;

  // Calculate probabilities for enabled events in this category
  // Filter out the last event to prevent immediate repetition
  const candidates = events
    .filter(e => config[e as keyof typeof config] && e !== lastEventRef.current)
    .map(e => {
      const cfg = config[e as keyof typeof config]!;
      const R = cfg.base + cfg.scale * normalizedIntensity;
      const λ = R / (1 - Math.min(R * cooldown, 0.9));
      return { event: e, p: λ * dt };
    });

  if (candidates.length === 0) return null;

  const roll = Math.random();
  let cumulativeP = 0;

  for (const candidate of candidates) {
    cumulativeP += candidate.p;
    if (roll < cumulativeP) {
      logger.info('EventEngine', `Event triggered: ${candidate.event}`, { 
        roll, 
        cumulativeP, 
        intensity: normalizedIntensity,
        category: config === MAIN_EVENT_CONFIG ? 'main' : 'visual'
      });
      lastTimestampRef.current = now;
      lastEventRef.current = candidate.event;
      return candidate.event;
    }
  }

  return null;
};

export const handleMainEvent = async (event: GameEvent, data: EventDataRef) => {
  await {
    climax: climaxEvent,
    pause: pauseEvent,
    halfPace: halfPaceEvent,
    risingPace: risingPaceEvent,
    doublePace: doublePaceEvent,
    randomPace: randomPaceEvent,
  }[event as Exclude<GameEvent, GameEvent.randomGrip> | GameEvent.climax](data);
};

export const handleVisualEvent = async (event: GameEvent, data: EventDataRef) => {
  await {
    randomGrip: randomGripEvent,
  }[event as GameEvent.randomGrip](data);
};

export const silenceEventData = (data: EventDataRef): EventDataRef => {
  return {
    get current() {
      return {
        ...data.current,
        game: {
          ...data.current.game,
          sendMessage: () => {},
        },
      };
    },
  };
};

export const GameEvents = () => {
  const [phase] = useGameValue('phase');
  const sendMessage = useSendMessage();

  const data = useAutoRef<EventData>({
    game: {
      ...createStateSetters(...useGame()),
      sendMessage: sendMessage,
    },
    settings: createStateSetters(...useSettings()),
  });

  const lastMainEventTimestamp = useRef(Date.now());
  const lastVisualEventTimestamp = useRef(Date.now());
  const lastMainEvent = useRef<GameEvent | null>(null);
  const lastVisualEvent = useRef<GameEvent | null>(null);

  const initialized = useRef(false);
  useEffect(() => {
    if ([GamePhase.active, GamePhase.modifier, GamePhase.interruption].includes(phase) && !initialized.current) {
      lastMainEventTimestamp.current = Date.now();
      lastVisualEventTimestamp.current = Date.now();
      lastMainEvent.current = null;
      lastVisualEvent.current = null;
      initialized.current = true;
    } else if (phase === GamePhase.warmup) {
      initialized.current = false;
    }
  }, [phase]);

  // Main Event Loop (Blocking)
  useLooping(
    async () => {
      const event = rollEventDice(data, MAIN_EVENT_CONFIG, lastMainEventTimestamp, lastMainEvent, EVENT_COOLDOWN);
      if (event) {
        await handleMainEvent(event, data);
      }
    },
    1000,
    [GamePhase.active, GamePhase.modifier, GamePhase.interruption].includes(phase)
  );

  // Visual Event Loop (Independent)
  useLooping(
    async () => {
      const event = rollEventDice(data, VISUAL_EVENT_CONFIG, lastVisualEventTimestamp, lastVisualEvent, 3); // Shorter 3s cooldown for visuals
      if (event) {
        await handleVisualEvent(event, data);
      }
    },
    1000,
    [GamePhase.active, GamePhase.modifier, GamePhase.interruption].includes(phase)
  );

  return null;
};
