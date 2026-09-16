import React from 'react';
import { EmotionRegulationModal, RegulationMode } from './EmotionRegulationModal';

interface BreathingMiniGameProps {
  onComplete: () => void;
  onCancel?: () => void;
  targetName: string;
}

export const BreathingMiniGame: React.FC<BreathingMiniGameProps> = ({
  onComplete,
  onCancel,
  targetName,
}) => {
  return (
    <EmotionRegulationModal
      isOpen={true}
      targetName={targetName}
      onClose={onCancel || onComplete}
      onComplete={(_mode: RegulationMode) => onComplete()}
      initialMode="breathing"
    />
  );
};
