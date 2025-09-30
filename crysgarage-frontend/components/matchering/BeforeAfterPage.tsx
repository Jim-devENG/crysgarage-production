import React from 'react';
import { Button } from '../ui/button';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const BeforeAfterPage: React.FC<Props> = ({ onBack, onNext }) => {
  return (
    <div className="min-h-screen bg-crys-black text-crys-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-crys-gold mb-6">Before / After</h1>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <p className="text-white/70 text-sm mb-4">A/B preview for your Target and Mastered files.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="border-white/20 text-white/80">Back</Button>
            <Button onClick={onNext} className="bg-crys-gold text-black font-semibold">Continue to Download</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterPage;


