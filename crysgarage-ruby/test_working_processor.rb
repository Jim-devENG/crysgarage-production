#!/usr/bin/env ruby
# frozen_string_literal: true

# Test script for Working Audio Processor
# Tests real audio processing capabilities

require_relative 'working_audio_processor'

def create_test_wav_file(filename, duration_seconds = 5)
  puts "Creating test WAV file: #{filename}"
  
  require 'wavefile'
  
  # Create a simple test tone
  sample_rate = 44100
  frequency = 440  # A4 note
  amplitude = 0.3
  
  # Generate samples
  samples = []
  duration_seconds.times do |second|
    sample_rate.times do |sample|
      time = second + (sample.to_f / sample_rate)
      value = (amplitude * Math.sin(2 * Math::PI * frequency * time) * 32767).to_i
      samples << [value, value] # Stereo
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

def test_audio_processing
  puts "🎵 Testing Working Audio Processor"
  puts "=" * 50
  
  # Create test file
  test_file = "test_audio.wav"
  create_test_wav_file(test_file, 3)
  
  # Initialize processor
  processor = WorkingAudioProcessor.new({
    genre: 'afrobeats',
    tier: 'professional',
    target_lufs: -14.0
  })
  
  puts "\n🔧 Processing audio..."
  result = processor.process_audio(test_file)
  
  if result[:success]
    puts "\n✅ Processing successful!"
    puts "Session ID: #{result[:session_id]}"
    puts "Processing time: #{result[:processing_time].round(2)} seconds"
    puts "Output file: #{result[:processed_file]}"
    puts "Processing steps: #{result[:metadata][:processing_steps].join(', ')}"
    
    # Check if files are different
    original_size = File.size(test_file)
    processed_file = result[:processed_file]
    processed_size = File.size(processed_file)
    
    puts "\n📊 File Analysis:"
    puts "Original size: #{original_size} bytes"
    puts "Processed size: #{processed_size} bytes"
    puts "Size difference: #{(processed_size - original_size)} bytes"
    
    if processed_size != original_size
      puts "🎉 SUCCESS: Files are different - processing is working!"
      
      # Compare file contents to show real differences
      puts "\n🔍 Content Analysis:"
      compare_audio_files(test_file, processed_file)
    else
      puts "⚠️  WARNING: Files are identical - processing may not be working"
    end
    
    # Show processing report
    if result[:report]
      puts "\n📋 Processing Report:"
      puts "Original analysis: #{result[:report][:analysis]}"
    end
    
  else
    puts "\n❌ Processing failed: #{result[:error]}"
  end
  
  # Cleanup
  File.delete(test_file) if File.exist?(test_file)
end

def compare_audio_files(original_file, processed_file)
  require 'wavefile'
  
  begin
    # Read original file
    original_samples = []
    WaveFile::Reader.new(original_file) do |reader|
      reader.each_buffer(1024) do |buffer|
        original_samples.concat(buffer.samples.flatten)
        break if original_samples.length > 1000 # First 1000 samples
      end
    end
    
    # Read processed file
    processed_samples = []
    WaveFile::Reader.new(processed_file) do |reader|
      reader.each_buffer(1024) do |buffer|
        processed_samples.concat(buffer.samples.flatten)
        break if processed_samples.length > 1000 # First 1000 samples
      end
    end
    
    # Compare samples
    differences = 0
    original_samples.each_with_index do |sample, i|
      if i < processed_samples.length && sample != processed_samples[i]
        differences += 1
      end
    end
    
    puts "Sample differences: #{differences} out of #{[original_samples.length, processed_samples.length].min}"
    puts "Difference percentage: #{(differences.to_f / [original_samples.length, processed_samples.length].min * 100).round(2)}%"
    
    if differences > 0
      puts "🎵 AUDIO PROCESSING IS WORKING! Samples have been modified."
    else
      puts "⚠️  No sample differences detected - processing may be copying files"
    end
    
  rescue => e
    puts "Error comparing files: #{e.message}"
  end
end

if __FILE__ == $0
  test_audio_processing
end 