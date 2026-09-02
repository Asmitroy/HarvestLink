import { useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import FarmerPane from '../components/FarmerPane';
import VoiceOverlay from '../components/modals/VoiceOverlay';

export default function FarmerDashboard() {
  const [voiceCrop, setVoiceCrop] = useState(null);
  const [voiceQty,  setVoiceQty]  = useState(null);
  const [isVoiceOpen, setVoiceOpen] = useState(false);

  return (
    <DashboardShell>
      <FarmerPane
        voiceCrop={voiceCrop}
        voiceQty={voiceQty}
        clearVoice={() => { setVoiceCrop(null); setVoiceQty(null); }}
        onVoice={() => setVoiceOpen(true)}
        onEdit={() => {}}
      />
      
      {isVoiceOpen && (
        <VoiceOverlay
          onClose={() => setVoiceOpen(false)}
          onRecognized={(c, q) => {
            setVoiceCrop(c);
            setVoiceQty(q);
            setVoiceOpen(false);
          }}
        />
      )}
    </DashboardShell>
  );
}
