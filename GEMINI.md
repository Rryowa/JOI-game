# joi.how

A React-based web application for a "jack-off-instruction stroke-to-the-beat slideshow" experience.

## Recent Changes

### Event System Refactor
- **Removed Events:** Deleted "Edge Safety Net" and "Clean Up Mess" to streamline the experience and remove forced interruptions.
- **Climax Overhaul:** 
  - Removed the "Are you edging?" confirmation prompt for a more seamless transition.
  - Replaced the fixed 3-2-1 countdown with a random, visible countdown (5-30s) that triggers automatically at 100% intensity.
- **Unified Duration Strategy:** Implemented a `getWeightedDuration` utility that skews event durations based on intensity. High intensity now leads to shorter pauses and longer high-paced bursts.
- **Poisson-based Event Engine:** Transitioned from a "fixed chance" model to a Rate-based (Poisson-like) model with a 15s strict cooldown for main events.
- **Dual Independent Event Loops:** Separated events into "Main" (pacing/phase blocking) and "Visual" (aesthetic/non-blocking) categories.
- **Phase-Aware Pace Engine:** Implemented a `GamePace` component that handles natural $O(n^2)$-like progression ($0.1t + 0.9t^6$) during `active` and `finale` phases, while respecting `modifier` and `interruption` phases triggered by events.

### Dynamic Edging Engine
- **Pace-Dependent Intensity:** Intensity progression is no longer a fixed timer. The engine now calculates a "delta" every second based on the ratio of your current pace to the intensity-based "normal" pace.
  - **Acceleration:** During "Double Pace," intensity rises up to 2x faster, bringing the climax sooner.
  - **Recovery:** During "Half Pace" or "Pause," intensity progression slows down or stalls, effectively extending the game duration to allow for recovery.
  - **Balance:** This ensures the player stays on the "actual edge" as the session's length directly reflects their speed and performance.

### UI & UX Improvements
- **Message Centering:** Moved game messages from the top-right corner to the center of the screen, positioned directly above the beat circle with 50% opacity.
- **Grip System Overhaul:** Replaced hand-based grip (Left/Right) with a sensation-focused system:
  - **Base Only:** Restricted grip to the base of the shaft.
  - **Tip Only:** Restricted grip to the glans/tip.
  - **Full Grip:** Standard unrestricted stroke.
  - **Visuals:** Integrated distinct FontAwesome icons (`faHandFist`, `faHandPointer`, `faHands`) to clearly communicate current grip requirements.
- **Uncapped Modifiers:** "Double Pace" can now exceed the user-defined `maxPace` (up to 12 BPM) to maintain its impact as a high-intensity event.

## Game Design Reflections

To keep the game interesting and avoid monotony, the engine focuses on **Rhythm and Escalation**.

### Current Strengths
- **Predictable Escalation:** The Poisson engine ensures that as intensity rises, the "pressure" (frequency of events) increases predictably but remains varied.
- **Contextual Translation:** Dynamic text makes the experience feel personalized.

### Potential New Events & Ideas
1. **"Breathless" (Interruption):** A very short, high-intensity pause (2-3s) that triggers frequently near the climax to simulate gasping for air or hesitation.
2. **"Grip Swap" (Modifier):** Instead of just random hands, specific instructions like "Thumb and index only" or "Whole palm" to vary physical sensation.
3. **"Visual Distraction" (Modifier):** Temporarily speed up the slideshow or add visual filters (blur, flash) to disorient the player.
4. **"Conditional Events":** Events that only trigger if certain conditions are met (e.g., a "Double Pace" that only triggers if the current pace is already high).
5. **Interactive Prompts:** Mid-game questions that affect the intensity or duration (e.g., "Are you close?" -> Yes increases intensity/pace, No adds more time).

### Engagement Strategies
- **Aural Feedback:** Use different tones or frequencies for different event types to create a "language" the player learns.
- **Visual Pacing:** Pulse the background or UI elements in sync with the current pace to reinforce the rhythm.

### UI & Immersion Concepts
- **Tunnel Vision (Vignetting):** Darken or blur the edges of the screen as intensity rises to force focus onto the center image.
- **Chromatic Aberration:** Introduce a slight color-bleeding effect that increases with intensity to simulate psychological "instability."
- **UI Shake:** Implement a rhythmic viewport shake that triggers during high-paced events (like "Double Pace") in time with the stroke.
- **Rhythmic Pulse:** A subtle radial gradient in the background that pulses in sync with the current beat/metronome.
- **Visual Metronome:** A shrinking/expanding ring around the central image to help the player stay "locked in" without reading numbers.
- **Glitch Signifiers:** Use high-impact visual flashes or "static" transitions when major events (like "Pause") trigger to break the player's rhythm.
- **Dynamic Minimalism:** Automatically fade out non-essential HUD elements (timer, settings, etc.) as intensity passes 75% to remove distractions.

## Tech Stack

- **Framework:** [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Styled Components](https://styled-components.com/), [Framer Motion](https://www.framer.com/motion/) for animations, and [Lit](https://lit.dev/) (via [WebAwesome](https://awesome.me/webawesome)).
- **Routing:** [React Router DOM v6](https://reactrouter.com/)
- **State Management:** Custom context-based providers with `localStorage` persistence (see `src/utils/localstorage.tsx`).
- **Haptics:** [Buttplug.io](https://buttplug.io/) for vibrator integration.
- **APIs:** [Axios](https://axios-http.com/) for fetching content from e621 and Walltaker.

## Architecture

The application follows a provider-heavy architecture to manage global state and side effects.

### Core Providers (`src/index.tsx`)
1.  **SettingsProvider:** Manages application configuration (duration, pace, gender settings).
2.  **ImageProvider:** Handles image sourcing and selection.
3.  **LocalImageProvider:** Manages locally imported files.
4.  **VibratorProvider:** Handles Buttplug.io device connection and haptic feedback.
5.  **E621Provider:** Manages e621 API integration.

### Routes (`src/app/App.tsx`)
- `/`: **HomePage** – Content discovery, settings, and game preparation.
- `/play`: **GamePage** – The core engine that manages the slideshow, pacing, and interactive events.

## Key Features

- **Content Sourcing:** Supports e621, Walltaker, and local file imports.
- **Game Engine:** Dynamic pacing, intensity management, and random events (e.g., pause, pace changes, climax) defined in `src/game/components/events`.
- **Dynamic Translation:** The `useTranslate` hook in `src/settings/SettingsProvider.tsx` adapts text instructions based on player settings (gender, body type, hypno style).
- **PWA Support:** Includes a service worker for offline capabilities and installation.

## Development Workflows

### Commands
- `yarn dev`: Start the Vite development server.
- `yarn build`: Run type-checking (`tsc`) and build for production.
- `yarn lint`: Run ESLint to check for code quality issues.
- `yarn format`: Format the codebase using Prettier.
- `yarn preview`: Preview the production build locally.

### Key Directories
- `src/game`: Contains the core gameplay logic and event definitions.
- `src/settings`: Contains global configuration and providers.
- `src/common`: Reusable UI components.
- `src/utils`: Utility functions for haptics, state, and translation.
- `src/e621`, `src/walltaker`, `src/local`: Service-specific logic for content fetching.

## Conventions
- **Naming:** PascalCase for components and providers, camelCase for functions and variables.
- **Styling:** Prefer Styled Components for component-specific styles.
- **State:** Use `createLocalStorageProvider` for settings that should persist across sessions.
