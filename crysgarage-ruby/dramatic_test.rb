#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'dramatic_audio_processor'

# Dramatic test to show OBVIOUS audio processing differences
puts "🎵 DRAMATIC Audio Processing Test"
puts "=" * 50

# Create a complex test file with multiple frequencies
require 'wavefile'

def create_complex_test_wav_file(filename, duration_seconds = 5)
  puts "Creating COMPLEX test WAV file: #{filename}"
  
  sample_rate = 44100
  amplitude = 0.4
  
  # Generate samples with multiple frequencies
  samples = []
  duration_seconds.times do |second|
    sample_rate.times do |sample|
      time = second + (sample.to_f / sample_rate)
      
      # Create complex waveform with multiple frequencies
      freq1 = 440  # A4
      freq2 = 880  # A5
      freq3 = 220  # A3
      
      # Mix multiple frequencies with different phases
      value1 = Math.sin(2 * Math::PI * freq1 * time)
      value2 = Math.sin(2 * Math::PI * freq2 * time + Math::PI/4) * 0.5
      value3 = Math.sin(2 * Math::PI * freq3 * time + Math::PI/2) * 0.3
      
      # Combine frequencies
      combined = (value1 + value2 + value3) * amplitude
      
      # Add some variation over time
      envelope = Math.sin(time * 0.5) * 0.2 + 0.8
      final_value = (combined * envelope * 32767).to_i
      
      # Stereo with slight difference
      left = final_value
      right = (final_value * 0.9).to_i
      
      samples << [left, right]
    end
  end
  
  # Write WAV file
  format = WaveFile::Format.new(2, :pcm_16, sample_rate)
  WaveFile::Writer.new(filename, format) do |writer|
    buffer = WaveFile::Buffer.new(samples, format)
    writer.write(buffer)
  end
  
  puts "Created complex test file: #{filename} (#{File.size(filename)} bytes)"
end

# Create test file
test_file = "complex_test.wav"
create_complex_test_wav_file(test_file, 3)

# Process the file with DRAMATIC effects
processor = DramaticAudioProcessor.new({
  genre: 'afrobeats',
  tier: 'professional'
})

puts "\n🎚️ Processing audio with DRAMATIC effects..."
result = processor.process_audio(test_file)

if result[:success]
  puts "✅ DRAMATIC Processing successful!"
  puts "Session ID: #{result[:session_id]}"
  
  # Get the actual processed file path
  processed_file = "output/#{result[:session_id]}/mastered_audio.wav"
  
  if File.exist?(processed_file)
    original_size = File.size(test_file)
    processed_size = File.size(processed_file)
    
    puts "\n📊 DRAMATIC Results:"
    puts "Original: #{original_size} bytes"
    puts "Processed: #{processed_size} bytes"
    puts "Difference: #{processed_size - original_size} bytes"
    
    # Detailed sample comparison
    puts "\n🔍 DRAMATIC Sample Analysis:"
    compare_samples_dramatically(test_file, processed_file)
    
    # Show file differences
    puts "\n📈 DRAMATIC File Analysis:"
    analyze_file_differences(test_file, processed_file)
    
  else
    puts "❌ Processed file not found: #{processed_file}"
  end
else
  puts "❌ Processing failed: #{result[:error]}"
end

# Cleanup
File.delete(test_file) if File.exist?(test_file)

def compare_samples_dramatically(original_file, processed_file)
  require 'wavefile'
  
  # Read first 100 samples from both files
  original_samples = []
  processed_samples = []
  
  WaveFile::Reader.new(original_file) do |reader|
    reader.each_buffer(100) do |buffer|
      original_samples = buffer.samples.flatten[0..99]
      break
    end
  end
  
  WaveFile::Reader.new(processed_file) do |reader|
    reader.each_buffer(100) do |buffer|
      processed_samples = buffer.samples.flatten[0..99]
      break
    end
  end
  
  # Count differences and calculate magnitude changes
  differences = 0
  total_magnitude_change = 0
  max_magnitude_change = 0
  
  original_samples.each_with_index do |sample, i|
    if i < processed_samples.length
      if sample != processed_samples[i]
        differences += 1
        magnitude_change = (processed_samples[i] - sample).abs
        total_magnitude_change += magnitude_change
        max_magnitude_change = [max_magnitude_change, magnitude_change].max
      end
    end
  end
  
  puts "Sample differences: #{differences}/#{original_samples.length}"
  puts "Difference rate: #{(differences.to_f / original_samples.length * 100).round(1)}%"
  puts "Average magnitude change: #{(total_magnitude_change / differences).round(1)}" if differences > 0
  puts "Maximum magnitude change: #{max_magnitude_change}"
  
  if differences > 0
    puts "🎵 DRAMATIC AUDIO PROCESSING IS WORKING!"
    puts "   Samples have been DRAMATICALLY modified!"
    
    # Show some specific examples
    puts "\n📋 Sample Comparison Examples:"
    original_samples[0..9].each_with_index do |sample, i|
      if i < processed_samples.length
        change = processed_samples[i] - sample
        change_percent = (change.to_f / sample * 100).round(1) if sample != 0
        puts "   Sample #{i}: #{sample} → #{processed_samples[i]} (change: #{change}, #{change_percent}%)"
      end
    end
  else
    puts "⚠️  No differences detected"
  end
end

def analyze_file_differences(original_file, processed_file)
  require 'wavefile'
  
  # Analyze peak levels
  original_peak = 0
  processed_peak = 0
  
  WaveFile::Reader.new(original_file) do |reader|
    reader.each_buffer(1024) do |buffer|
      peak = buffer.samples.flatten.map(&:abs).max
      original_peak = [original_peak, peak].max
    end
  end
  
  WaveFile::Reader.new(processed_file) do |reader|
    reader.each_buffer(1024) do |buffer|
      peak = buffer.samples.flatten.map(&:abs).max
      processed_peak = [processed_peak, peak].max
    end
  end
  
  puts "Peak level comparison:"
  puts "  Original peak: #{original_peak}"
  puts "  Processed peak: #{processed_peak}"
  puts "  Peak change: #{processed_peak - original_peak}"
  puts "  Peak change %: #{((processed_peak - original_peak).to_f / original_peak * 100).round(1)}%"
  
  if processed_peak > original_peak * 1.5
    puts "🎚️ DRAMATIC LOUDNESS INCREASE DETECTED!"
  elsif processed_peak < original_peak * 0.7
    puts "🔇 DRAMATIC LOUDNESS DECREASE DETECTED!"
  else
    puts "🔊 Moderate loudness change detected"
  end
end 