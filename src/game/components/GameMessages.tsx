import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GameMessage, GameMessagePrompt, useGameValue } from '../GameProvider';
import { defaultTransition, playTone } from '../../utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslate } from '../../settings';

const StyledGameMessages = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  pointer-events: none;
  opacity: 0.5;
  & > * {
    pointer-events: auto;
  }
`;

const StyledGameMessage = styled(motion.div)`
  display: flex;
  margin-bottom: 1px;
`;

const StyledGameMessageTitle = styled(motion.div)`
  color: var(--overlay-color);

  font-size: 2rem;
  font-weight: bold;
  padding: 10px;

  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
`;

const StyledGameMessageDescription = styled(motion.p)`
  color: var(--overlay-color);

  font-size: 2rem;
  font-weight: bold;
  padding: 10px;

  margin: unset;
  margin-left: 1px;

  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
`;

const StyledGameMessageButton = styled(motion.button)`
  background: transparent;
  color: var(--button-color);

  height: 100%;

  font-size: 2rem;
  font-weight: bold;
  padding: 10px;
  cursor: pointer;

  transition: var(--hover-transition);

  margin-left: 1px;
  border: none;

  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;

  &:hover {
    filter: var(--hover-filter);
    text-decoration: underline;
  }
`;

export const GameMessages = () => {
  const [messages, setMessages] = useGameValue('messages');
  const timersRef = useRef<Record<string, number>>({});
  const lastMessagesRef = useRef<GameMessage[]>([]);
  const translate = useTranslate();

  useEffect(() => {
    const previousMessages = lastMessagesRef.current;
    const currentTimers = timersRef.current;

    // 1. Identify removed messages and clear their timers
    const removedMessages = previousMessages.filter(
      pm => !messages.find(m => m.id === pm.id)
    );

    removedMessages.forEach(rm => {
      if (currentTimers[rm.id]) {
        window.clearTimeout(currentTimers[rm.id]);
        delete currentTimers[rm.id];
      }
    });

    // 2. Identify added or updated messages that need a timer
    messages.forEach(message => {
      const prevMessage = previousMessages.find(pm => pm.id === message.id);
      const isNew = !prevMessage;
      // Check if message object changed reference (implies update)
      const isUpdated = prevMessage && prevMessage !== message;

      if (message.duration && (isNew || isUpdated)) {
        // Clear existing timer if any (to reset)
        if (currentTimers[message.id]) {
          window.clearTimeout(currentTimers[message.id]);
        }

        // Set new timer
        currentTimers[message.id] = window.setTimeout(() => {
          setMessages(msgs => msgs.filter(m => m.id !== message.id));
          delete currentTimers[message.id];
        }, message.duration);
      }
    });

    // 3. Play tone for new messages
    const addedMessages = messages.filter(
      message => !previousMessages.find(pm => pm.id === message.id)
    );
    if (addedMessages.length > 0) {
      playTone(200);
    }

    lastMessagesRef.current = messages;
  }, [messages, setMessages]);

  const onMessageClick = useCallback(
    async (message: GameMessage, prompt: GameMessagePrompt) => {
      await prompt.onClick();
      setMessages(msgs => msgs.filter(m => m.id !== message.id));
    },
    [setMessages]
  );

  return (
    <StyledGameMessages>
      <AnimatePresence>
        {messages.map(message => (
          <StyledGameMessage key={message.id}>
            <StyledGameMessageTitle
              key={message.title}
              initial={{
                y: '-100%',
                opacity: 0,
              }}
              animate={{
                y: '0%',
                opacity: 1,
              }}
              exit={{
                y: '-100%',
                opacity: 0,
              }}
              transition={defaultTransition}
            >
              {translate(message.title)}
            </StyledGameMessageTitle>
            {message.description && (
              <StyledGameMessageDescription
                key={message.description}
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                transition={{
                  ...defaultTransition,
                  ease: 'circInOut',
                }}
              >
                {message.description}
              </StyledGameMessageDescription>
            )}
            {message.prompts?.map(prompt => (
              <StyledGameMessageButton
                key={prompt.title}
                initial={{ y: '-100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{
                  ...defaultTransition,
                  ease: 'circInOut',
                }}
                onClick={() => onMessageClick(message, prompt)}
              >
                {translate(prompt.title)}
              </StyledGameMessageButton>
            ))}
          </StyledGameMessage>
        ))}
      </AnimatePresence>
    </StyledGameMessages>
  );
};
