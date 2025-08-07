import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-crys-gold mb-4">Test Component</h1>
        <p className="text-xl">If you can see this, React is working!</p>
        <p className="text-gray-400 mt-2">Professional Tier should be accessible at /professional</p>
      </div>
    </div>
  );
};

export default TestComponent; 