#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'working_audio_processor'

# Simple test to verify audio processing
puts "🎵 Testing Audio Processing System"
puts "=" * 40

# Create a simple test file
require 'wavefile'

# Create test tone
sample_rate = 44100
frequency = 440  # A4 note
amplitude = 0.3
duration = 2 # seconds

samples = []
duration.times do |second|
  sample_rate.times do |sample|
    time = second + (sample.to_f / sample_rate)
    value = (amplitude * Math.sin(2 * Math::PI * frequency * time) * 32767).to_i
    samples << [value, value] # Stereo
  end
end

# Write test file
test_file = "simple_test.wav"
format = WaveFile::Format.new(2, :pcm_16, sample_rate)
WaveFile::Writer.new(test_file, format) do |writer|
  buffer = WaveFile::Buffer.new(samples, format)
  writer.write(buffer)
end

puts "Created test file: #{test_file} (#{File.size(test_file)} bytes)"

# Process the file
processor = WorkingAudioProcessor.new({
  genre: 'afrobeats',
  tier: 'professional'
})

puts "\nProcessing audio..."
result = processor.process_audio(test_file)

if result[:success]
  puts "✅ Processing successful!"
  puts "Session ID: #{result[:session_id]}"
  
  # Get the actual processed file path
  processed_file = "output/#{result[:session_id]}/mastered_audio.wav"
  
  if File.exist?(processed_file)
    original_size = File.size(test_file)
    processed_size = File.size(processed_file)
    
    puts "\n📊 Results:"
    puts "Original: #{original_size} bytes"
    puts "Processed: #{processed_size} bytes"
    puts "Difference: #{processed_size - original_size} bytes"
    
    if processed_size != original_size
      puts "🎉 SUCCESS: Files are different - processing is working!"
      
      # Quick sample comparison
      puts "\n🔍 Sample Analysis:"
      compare_samples(test_file, processed_file)
    else
      puts "⚠️  Files are identical"
    end
  else
    puts "❌ Processed file not found: #{processed_file}"
  end
else
  puts "❌ Processing failed: #{result[:error]}"
end

# Cleanup
File.delete(test_file) if File.exist?(test_file)

def compare_samples(original_file, processed_file)
  require 'wavefile'
  
  # Read first few samples from both files
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
  
  # Count differences
  differences = 0
  original_samples.each_with_index do |sample, i|
    if i < processed_samples.length && sample != processed_samples[i]
      differences += 1
    end
  end
  
  puts "Sample differences: #{differences}/#{original_samples.length}"
  puts "Difference rate: #{(differences.to_f / original_samples.length * 100).round(1)}%"
  
  if differences > 0
    puts "🎵 AUDIO PROCESSING IS WORKING! Samples have been modified."
  else
    puts "⚠️  No differences detected"
  end
end 