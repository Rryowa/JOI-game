import styled from 'styled-components';
import {
  GameHypno,
  GameImages,
  GameMeter,
  GameIntensity,
  GameSound,
  GameInstructions,
  GamePace,
  GameEvents,
  GameMessages,
  GameWarmup,
  GameEmergencyStop,
  GameSettings,
  GameVibrator,
} from './components';
import { GameProvider, Paws, PawLabels, useGameValue } from './GameProvider';

const StyledGamePage = styled.div`
  position: relative;

  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledLogicElements = styled.div`
  // these elements have no visual representation. This style is merely to group them.
`;

const StyledTopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  & > *:first-child {
    margin-bottom: 8px;
  }

  & > *:nth-child(2) {
    margin-left: auto;
  }
`;

const StyledCenter = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > *:nth-child(2) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
  }

  & > *:first-child {
    margin-bottom: 20px;
    z-index: 1;
  }
`;

const StyledGripLabel = styled.div`
  position: absolute;
  top: calc(50% + 145px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;

  color: var(--overlay-color);
  font-size: 2rem;
  font-weight: bold;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
  pointer-events: none;
  opacity: 0.5;
`;

const GripLabel = () => {
  const [paws] = useGameValue('paws');
  if (paws === Paws.none) return null;
  return <StyledGripLabel>{PawLabels[paws]}</StyledGripLabel>;
};

const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  align-items: flex-end;

  & > *:nth-child(2) {
    margin-left: auto;
  }
`;

export const GamePage = () => {
  return (
    <GameProvider>
      <StyledGamePage>
        <StyledLogicElements>
          <GameWarmup />
          <GameIntensity />
          <GamePace />
          <GameSound />
          <GameVibrator />
          <GameEvents />
        </StyledLogicElements>
        <GameImages />
        <StyledTopBar>
          <GameInstructions />
        </StyledTopBar>
        <StyledCenter>
          <GameMessages />
          <GameMeter />
          <GameHypno />
          <GripLabel />
        </StyledCenter>
        <StyledBottomBar>
          <GameSettings />
          <GameEmergencyStop />
        </StyledBottomBar>
      </StyledGamePage>
    </GameProvider>
  );
};
