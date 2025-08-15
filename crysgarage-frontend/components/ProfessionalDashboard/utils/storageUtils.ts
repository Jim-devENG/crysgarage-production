export const loadStateFromStorage = () => {
  try {
    const savedState = sessionStorage.getItem('professionalTierState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        currentStep: parsed.currentStep || 1,
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
    selectedGenre: null,
    processedAudioUrl: null,
    isProcessing: false,
    downloadFormat: 'wav',
    fileInfo: null
  };
};

export const saveStateToStorage = (state: any) => {
  try {
    sessionStorage.setItem('professionalTierState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state to storage:', error);
  }
};
