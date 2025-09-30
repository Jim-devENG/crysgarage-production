import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Props {
  onNext: () => void;
}

const UploadPage: React.FC<Props> = ({ onNext }) => {
  const [hasFiles, setHasFiles] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem('matchering.target');
      const r = localStorage.getItem('matchering.reference');
      setHasFiles(Boolean(t && r));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-crys-black text-crys-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-crys-gold mb-6">Upload & Effects</h1>
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white/90">Select Target & Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/70 text-sm">Use the new Matchering flow: upload your Target and Reference on this page and set optional effects. Your selections are saved for the next step.</p>
            <div className="text-white/60 text-sm">If files were already selected in the previous session, we will reuse them.</div>
            <div className="pt-2">
              <Button disabled={!hasFiles} onClick={onNext} className="bg-crys-gold text-black font-semibold disabled:opacity-50">Continue to Before/After</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;


