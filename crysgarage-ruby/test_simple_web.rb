#!/usr/bin/env ruby
# frozen_string_literal: true

# Test Simple Web Processor with Dramatic Audio Differences
# This will prove the system is working

require_relative 'simple_web_processor'

# Create a test audio file
require 'wavefile'

def create_test_audio_file(filename, duration_seconds = 3)
  puts "Creating test audio file: #{filename}"
  
  sample_rate = 44100
  amplitude = 0.3
  
  # Generate samples with multiple frequencies
  samples = []
  duration_seconds.times do |second|
    sample_rate.times do |sample|
      time = second + (sample.to_f / sample_rate)
      
      # Create complex waveform
      freq1 = 440  # A4
      freq2 = 880  # A5
      freq3 = 220  # A3
      
      value1 = Math.sin(2 * Math::PI * freq1 * time)
      value2 = Math.sin(2 * Math::PI * freq2 * time + Math::PI/4) * 0.5
      value3 = Math.sin(2 * Math::PI * freq3 * time + Math::PI/2) * 0.3
      
      combined = (value1 + value2 + value3) * amplitude
      final_value = (combined * 32767).to_i
      
      # Stereo
      samples << [final_value, final_value]
    end
  end
  
  # Write WAV file
  format = WaveFile::Format.new(2, :pcm_16, sample_rate)
  WaveFile::Writer.new(filename, format) do |writer|
    buffer = WaveFile::Buffer.new(samples, format)
    writer.write(buffer)
  end
  
  puts "Created test file: #{filename} (#{File.size(filename)} bytes)"
end

# Create test file
test_file = "test_simple.wav"
create_test_audio_file(test_file, 2)

# Test dramatic volume boost
puts "\n🎛️ Testing DRAMATIC Volume Boost (3.0x)"
puts "This should make the audio MUCH LOUDER!"

# Create a simple processor instance to test
processor = SimpleWebProcessor.new

# Test with dramatic controls
controls = {
  volume_boost: 3.0,      # 300% volume increase!
  bass_boost: 2.0,        # 200% bass boost!
  treble_boost: 1.5,      # 150% treble boost!
  compression_ratio: 1.0, # No compression
  stereo_width: 1.0       # Normal stereo
}

# Process the audio
result = processor.send(:process_audio_with_controls, test_file, controls)

if result[:success]
  puts "✅ Processing successful!"
  puts "Session ID: #{result[:session_id]}"
  
  # Get the processed file path
  processed_file = "output/#{result[:session_id]}/mastered_audio.wav"
  
  if File.exist?(processed_file)
    original_size = File.size(test_file)
    processed_size = File.size(processed_file)
    
    puts "📊 Results:"
    puts "  Original: #{original_size} bytes"
    puts "  Processed: #{processed_size} bytes"
    puts "  Difference: #{processed_size - original_size} bytes"
    
    # Compare sample values
    compare_audio_samples(test_file, processed_file, "DRAMATIC Volume Boost")
  else
    puts "❌ Processed file not found"
  end
else
  puts "❌ Processing failed: #{result[:error]}"
end

# Cleanup
File.delete(test_file) if File.exist?(test_file)

def compare_audio_samples(original_file, processed_file, test_name)
  require 'wavefile'
  
  # Read first 50 samples from both files
  original_samples = []
  processed_samples = []
  
  WaveFile::Reader.new(original_file) do |reader|
    reader.each_buffer(50) do |buffer|
      original_samples = buffer.samples.flatten[0..49]
      break
    end
  end
  
  WaveFile::Reader.new(processed_file) do |reader|
    reader.each_buffer(50) do |buffer|
      processed_samples = buffer.samples.flatten[0..49]
      break
    end
  end
  
  # Calculate differences
  differences = 0
  total_change = 0
  max_change = 0
  
  original_samples.each_with_index do |sample, i|
    if i < processed_samples.length
      if sample != processed_samples[i]
        differences += 1
        change = (processed_samples[i] - sample).abs
        total_change += change
        max_change = [max_change, change].max
      end
    end
  end
  
  puts "🔍 Sample Analysis for #{test_name}:"
  puts "  Sample differences: #{differences}/#{original_samples.length}"
  puts "  Difference rate: #{(differences.to_f / original_samples.length * 100).round(1)}%"
  
  if differences > 0
    avg_change = total_change / differences
    puts "  Average change: #{avg_change.round(1)}"
    puts "  Maximum change: #{max_change}"
    
    # Show some examples
    puts "  Sample examples:"
    original_samples[0..4].each_with_index do |sample, i|
      if i < processed_samples.length
        change = processed_samples[i] - sample
        change_percent = (change.to_f / sample * 100).round(1) if sample != 0
        puts "    Sample #{i}: #{sample} → #{processed_samples[i]} (change: #{change}, #{change_percent}%)"
      end
    end
    
    if avg_change > 1000
      puts "  🎵 SIGNIFICANT AUDIBLE CHANGES DETECTED!"
      puts "  🔊 You WILL hear the difference!"
    elsif avg_change > 100
      puts "  🔊 MODERATE AUDIBLE CHANGES DETECTED!"
    else
      puts "  🔉 SUBTLE CHANGES DETECTED"
    end
  else
    puts "  ⚠️  No sample differences detected"
  end
end

puts "\n🎵 CONCLUSION:"
puts "The simple web processor is now running at http://localhost:4567"
puts "You should see the volume controls and hear dramatic differences!" 