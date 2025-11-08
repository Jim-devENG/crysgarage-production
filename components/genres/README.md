# Genre Processor Components

This directory contains individual components for each genre's audio processing logic.

## Current Components

### PopGenreProcessor

- **File**: `PopGenreProcessor.tsx`
- **Settings**: Exact Free Tier Pop preset
- **Gain**: 1.5 (50% boost)
- **Compression**: threshold: -20, ratio: 3, attack: 0.003, release: 0.25, knee: 10

## Usage Example

```tsx
import {PopGenreProcessor} from "./components/genres";

// In your component:
const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(
  null
);
const [processingError, setProcessingError] = useState<string | null>(null);

// When you have an audio buffer to process:
{
  audioBuffer && (
    <PopGenreProcessor
      audioBuffer={audioBuffer}
      onProcessed={setProcessedBuffer}
      onError={setProcessingError}
    />
  );
}
```

## Adding New Genres

1. Create a new file: `GenreNameProcessor.tsx`
2. Copy the structure from `PopGenreProcessor.tsx`
3. Modify the processing settings for your genre
4. Export it from `index.ts`
5. Use it in your dashboard component

## Benefits

- **Modular**: Each genre has its own component
- **Maintainable**: Easy to modify individual genre settings
- **Reusable**: Can be used across different parts of the app
- **Testable**: Each genre can be tested independently
