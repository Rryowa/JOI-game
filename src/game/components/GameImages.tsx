import styled, { keyframes, css } from 'styled-components';
import { useImages, useSetting } from '../../settings';
import { useGameValue, GamePhase } from '../GameProvider';
import { motion } from 'framer-motion';
import { JoiImage } from '../../common';
import { useAutoRef, useImagePreloader, useLooping } from '../../utils';
import { ImageSize, ImageType } from '../../types';
import { useCallback, useMemo, useEffect, CSSProperties, useState, useRef } from 'react';

const jitter = keyframes`
  0% { transform: translate(0, 0); }
  25% { transform: translate(var(--jitter-offset), calc(-1 * var(--jitter-offset))); }
  50% { transform: translate(calc(-1 * var(--jitter-offset)), var(--jitter-offset)); }
  75% { transform: translate(var(--jitter-offset), var(--jitter-offset)); }
  100% { transform: translate(0, 0); }
`;

const StyledGameImages = styled.div`
  position: absolute;
  overflow: hidden;

  height: 100%;
  width: 100%;
`;

const StyledForegroundImage = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
  user-select: none;

  /* Default variable to avoid issues if not set */
  --intensity-factor: 0;
  --jitter-offset: calc(var(--intensity-factor) * 2px);

  ${props =>
    props.$active &&
    css`
      filter: drop-shadow(
          calc(var(--intensity-factor) * 5px) 0px 0.5px rgba(255, 0, 0, 0.5)
        )
        drop-shadow(
          calc(var(--intensity-factor) * -5px) 0px 0.5px rgba(0, 255, 255, 0.5)
        )
        saturate(calc(1 + var(--intensity-factor) * 0.5))
        contrast(calc(1 + var(--intensity-factor) * 0.2));
    `}

  ${props =>
    props.$active &&
    css`
      animation: ${jitter} 0.2s infinite;
    `}
`;

const StyledBackgroundImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
  pointer-events: none;
  user-select: none;

  display: flex;
  justify-items: center;
  align-items: center;

  filter: blur(30px);
`;

const StyledVignette = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  user-select: none;

  --vignette-opacity: 0;

  background: radial-gradient(
    circle,
    transparent 30%,
    rgba(0, 0, 0, var(--vignette-opacity)) 100%
  );
  
  /* Removed persistent blur as per user request */
`;

const StyledBlurSpot = styled.div`
  position: absolute;
  width: 30vmin;
  height: 30vmin;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  mask-image: radial-gradient(circle, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, black 40%, transparent 100%);
  
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.1s ease-in-out;
`;

export const GameImages = () => {
  const [images] = useImages();
  const [currentImage, setCurrentImage] = useGameValue('currentImage');
  const [seenImages, setSeenImages] = useGameValue('seenImages');
  const [nextImages, setNextImages] = useGameValue('nextImages');
  const [intensity] = useGameValue('intensity');
  const [pace] = useGameValue('pace');
  const [phase] = useGameValue('phase');
  const [videoSound] = useSetting('videoSound');
  const [highRes] = useSetting('highRes');
  const [imageDuration] = useSetting('imageDuration');
  const [intenseImages] = useSetting('intenseImages');

  // Refs for tracking state inside the effect loop without re-triggering it
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const [blurSpot, setBlurSpot] = useState({ x: 50, y: 50, visible: false });

  useImagePreloader(nextImages, highRes ? ImageSize.full : ImageSize.preview);

  const imagesTracker = useAutoRef({
    images,
    currentImage,
    setCurrentImage,
    seenImages,
    setSeenImages,
    nextImages,
    setNextImages,
  });

  const switchImage = useCallback(() => {
    const {
      images,
      currentImage,
      setCurrentImage,
      seenImages,
      setSeenImages,
      nextImages,
      setNextImages,
    } = imagesTracker.current;

    let next = nextImages;
    if (next.length <= 0) {
      next = images.sort(() => Math.random() - 0.5).slice(0, 3);
    }
    const seen = [...seenImages, ...(currentImage ? [currentImage] : [])];
    if (seen.length > images.length / 2) {
      seen.shift();
    }
    const unseen = images.filter(i => !seen.includes(i));
    setCurrentImage(next.shift());
    setSeenImages(seen);
    setNextImages([...next, unseen[Math.floor(Math.random() * unseen.length)]]);
  }, [imagesTracker]);

  const switchDuration = useMemo(() => {
    // If we are paused or the pace is 0, stop switching images.
    if (phase === GamePhase.pause || (pace <= 0 && phase !== GamePhase.warmup)) {
      return undefined;
    }

    if (intenseImages) {
      // 3s is the absolute minimum now.
      const minDuration = 3000;
      const scaleFactor = Math.max((100 - intensity) / 100, 0);
      return Math.max(imageDuration * scaleFactor * 1000, minDuration);
    }
    return imageDuration * 1000;
  }, [imageDuration, intenseImages, intensity, pace, phase]);

  useEffect(() => switchImage(), [switchImage]);

  useLooping(switchImage, switchDuration ?? 0, (switchDuration ?? 0) > 0);

  // Surprise Blur Effect Loop
  useEffect(() => {
    let timeoutId: number;
    let isActive = true;

    const scheduleNext = () => {
      if (!isActive) return;

      const currentIntensity = intensityRef.current;
      const currentPhase = phaseRef.current;
      const shouldActive = currentIntensity > 80 || currentPhase === GamePhase.modifier;

      if (!shouldActive) {
        setBlurSpot(s => (s.visible ? { ...s, visible: false } : s));
        timeoutId = window.setTimeout(scheduleNext, 1000);
        return;
      }

      // Random delay before showing (1s - 3s)
      const delay = Math.random() * 2000 + 1000;

      timeoutId = window.setTimeout(() => {
        if (!isActive) return;

        // Show at random position near center (30-70%)
        setBlurSpot({
          x: 30 + Math.random() * 40,
          y: 30 + Math.random() * 40,
          visible: true,
        });

        // Duration (0.5s - 1s)
        const duration = Math.random() * 500 + 500;

        setTimeout(() => {
          if (isActive) {
            setBlurSpot(s => ({ ...s, visible: false }));
            scheduleNext();
          }
        }, duration);
      }, delay);
    };

    scheduleNext();

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Calculate dynamic styles
  const isIntense = intensity > 80;
  const intensityFactor = Math.max(0, intensity - 80) / 20;
  
  const foregroundStyle = {
    '--intensity-factor': intensityFactor,
  } as CSSProperties;

  const vignetteStyle = {
    '--vignette-opacity': intensityFactor * 0.8,
  } as CSSProperties;

  return (
    <StyledGameImages>
      {currentImage && (
        <>
          <StyledBackgroundImage
            animate={{
              scale: [1.2, 1.4, 1.2],
            }}
            transition={{
              duration: (switchDuration ?? 5000) / 1000,
              repeat: Infinity,
            }}
          >
            <JoiImage
              thumb={currentImage.thumbnail}
              preview={currentImage.preview}
              full=''
              kind={currentImage.type === ImageType.video ? 'video' : 'image'}
              objectFit='cover'
            />
          </StyledBackgroundImage>
          <StyledForegroundImage 
            $active={isIntense} 
            style={foregroundStyle}
          >
            <JoiImage
              thumb={currentImage.thumbnail}
              preview={currentImage.preview}
              full={currentImage.full}
              // We remove this for now.
              // full={highRes ? currentImage.full : ''}
              kind={currentImage.type === ImageType.video ? 'video' : 'image'}
              playable={currentImage.type === ImageType.video}
              loud={videoSound}
              randomStart={true}
              objectFit='contain'
            />
          </StyledForegroundImage>
          <StyledVignette 
            $active={isIntense} 
            style={vignetteStyle}
          />
          <StyledBlurSpot 
            style={{
              top: `${blurSpot.y}%`,
              left: `${blurSpot.x}%`,
              opacity: blurSpot.visible ? 1 : 0
            }}
          />
        </>
      )}
    </StyledGameImages>
  );
};
