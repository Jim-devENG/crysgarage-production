export interface ProfessionalTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

export interface Genre {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface GenrePreset {
  gain: number;
  compression: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  eq: {
    low: number;
    mid: number;
    high: number;
  };
  truePeak: number;
  targetLufs: number;
}
