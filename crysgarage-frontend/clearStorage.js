// Utility script to clear corrupted localStorage data
// Run this in browser console if needed

console.log('Clearing corrupted localStorage data...');

// Clear all crysgarage related localStorage items
localStorage.removeItem('crysgarage_token');
localStorage.removeItem('crysgarage_user');

// Also clear any undefined or null values
Object.keys(localStorage).forEach(key => {
  if (key.includes('crysgarage')) {
    const value = localStorage.getItem(key);
    if (value === 'undefined' || value === 'null' || !value) {
      localStorage.removeItem(key);
      console.log(`Removed corrupted key: ${key}`);
    }
  }
});

console.log('localStorage cleared successfully!');
console.log('Please refresh the page.');
