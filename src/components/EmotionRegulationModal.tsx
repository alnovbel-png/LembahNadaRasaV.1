import React, { useState, useEffect } from 'react';
import { RegulationMode, RegulationMenuModal } from './regulation/RegulationMenuModal';
import { FullscreenRegulationGame } from './regulation/FullscreenRegulationGame';

export type { RegulationMode };

interface EmotionRegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (mode: RegulationMode) => void;
  targetName?: string;
  initialMode?: RegulationMode;
  directFullscreen?: boolean;
}

export const EmotionRegulationModal: React.FC<EmotionRegulationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  targetName = 'Pemain',
  initialMode = 'breathing',
  directFullscreen = true,
}) => {
  // Current view state: 'menu' (separate selection menu) or 'fullscreen-game' (fullscreen mini-game)
  const [viewState, setViewState] = useState<'menu' | 'fullscreen-game'>('fullscreen-game');
  const [selectedMode, setSelectedMode] = useState<RegulationMode>(initialMode);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(initialMode);
      // If triggered by NPC Story dialogue with specific target (e.g. Kiki), launch directly into that mini-game fullscreen!
      // If opened for general self-practice from HUD or [R] key, show the separate Mini-Game Selection Menu!
      if (targetName && targetName !== 'Pemain' && targetName !== 'Karakter Utama') {
        setViewState('fullscreen-game');
      } else {
        setViewState('menu');
      }
    }
  }, [isOpen, initialMode, targetName]);

  if (!isOpen) return null;

  // Handle selecting a technique from the separate menu
  const handleSelectModeFromMenu = (mode: RegulationMode) => {
    setSelectedMode(mode);
    setViewState('fullscreen-game');
  };

  // Handle returning from fullscreen game back to menu
  const handleBackToMenu = () => {
    setViewState('menu');
  };

  // If in 'menu' view, show the separate RegulationMenuModal
  if (viewState === 'menu') {
    return (
      <RegulationMenuModal
        isOpen={isOpen}
        targetName={targetName}
        onClose={onClose}
        onSelectMode={handleSelectModeFromMenu}
      />
    );
  }

  // If in 'fullscreen-game' view, immediately launch that mini-game in fullscreen with proper layout & ratio
  return (
    <FullscreenRegulationGame
      isOpen={isOpen}
      mode={selectedMode}
      targetName={targetName}
      onBackToMenu={handleBackToMenu}
      onClose={onClose}
      onComplete={onComplete}
    />
  );
};
