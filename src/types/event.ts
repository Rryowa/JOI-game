export enum GameEvent {
  randomPace = 'randomPace',
  halfPace = 'halfPace',
  doublePace = 'doublePace',
  risingPace = 'risingPace',
  pause = 'pause',
  climax = 'climax',
  randomGrip = 'randomGrip',
}

export const GameEventLabels: Record<GameEvent, string> = {
  randomPace: 'Random Pace',
  halfPace: 'Half Pace',
  doublePace: 'Double Pace',
  risingPace: 'Rising Pace',
  pause: 'Pause',
  climax: 'Climax',
  randomGrip: 'Random Grip',
};

export const GameEventDescriptions: Record<GameEvent, string> = {
  randomPace: 'Randomly select a new pace',
  halfPace: 'Paw at half the current pace for a few seconds',
  doublePace: 'Paw at twice the current pace for a few seconds',
  risingPace: 'Start from your lowest and slowly pick up speed',
  pause: 'Stop stroking for a little bit',
  climax: 'Creates an end point to the game',
  randomGrip: 'Randomly select new hands to play with',
};
