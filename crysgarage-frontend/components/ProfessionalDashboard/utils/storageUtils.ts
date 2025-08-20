export const loadStateFromStorage = () => {
  try {
    const savedState = sessionStorage.getItem('professionalDashboardState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      const hasFile = !!(parsed.selectedFile || parsed.fileInfo);
      return {
        currentStep: hasFile ? (parsed.currentStep || 1) : 1,
        selectedFile: parsed.selectedFile || null,
        selectedGenre: parsed.selectedGenre || null,
        processedAudioUrl: parsed.processedAudioUrl || null,
        isProcessing: false, // Always reset processing state
        downloadFormat: parsed.downloadFormat || 'wav',
        fileInfo: parsed.fileInfo || null
      };
    }
  } catch (error) {
    console.error('Error loading state from storage:', error);
  }
  return {
    currentStep: 1,
    selectedFile: null,
    selectedGenre: null,
    processedAudioUrl: null,
    isProcessing: false,
    downloadFormat: 'wav',
    fileInfo: null
  };
};

export const saveStateToStorage = (state: any) => {
  try {
    sessionStorage.setItem('professionalDashboardState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state to storage:', error);
  }
};
