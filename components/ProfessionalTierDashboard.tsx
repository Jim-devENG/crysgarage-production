
import React from 'react';
import ProfessionalDashboard from './ProfessionalDashboard';

interface ProfessionalTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

const ProfessionalTierDashboard: React.FC<ProfessionalTierDashboardProps> = (props) => {
  return <ProfessionalDashboard {...props} />;
};

export default ProfessionalTierDashboard;
