import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '../utils/logger';

const StyledErrorContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: monospace;
`;

const StyledButton = styled.button`
  padding: 1rem 2rem;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  cursor: pointer;
  &:hover { background: #444; }
`;

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('CRASH', error.message, { stack: error.stack, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <StyledErrorContainer>
          <h1>CRITICAL ERROR</h1>
          <p>The game engine has crashed. Please download the logs and report this.</p>
          <StyledButton onClick={() => logger.downloadLogs()}>Download Logs</StyledButton>
          <StyledButton onClick={() => window.location.href = '/'}>Go Home</StyledButton>
        </StyledErrorContainer>
      );
    }
    return this.props.children;
  }
}
