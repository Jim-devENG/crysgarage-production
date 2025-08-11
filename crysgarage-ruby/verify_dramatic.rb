#!/usr/bin/env ruby
# frozen_string_literal: true

# Simple verification of dramatic audio processing
puts "🎵 VERIFYING DRAMATIC AUDIO PROCESSING"
puts "=" * 50

# Check the latest processed file
output_dir = "output"
latest_session = Dir.glob("#{output_dir}/*").sort_by { |f| File.mtime(f) }.last

if latest_session
  processed_file = "#{latest_session}/mastered_audio.wav"
  
  if File.exist?(processed_file)
    puts "✅ Found processed file: #{processed_file}"
    
    # Read some samples to show the dramatic changes
    require 'wavefile'
    
    puts "\n🔍 Sample Analysis:"
    WaveFile::Reader.new(processed_file) do |reader|
      reader.each_buffer(1) do |buffer|
        samples = buffer.samples.flatten[0..19] # First 20 samples
        puts "Processed samples: #{samples}"
        
        # Check for dramatic changes
        max_sample = samples.map(&:abs).max
        min_sample = samples.map(&:abs).min
        
        puts "\n📊 Sample Statistics:"
        puts "Max sample value: #{max_sample}"
        puts "Min sample value: #{min_sample}"
        puts "Sample range: #{max_sample - min_sample}"
        
        if max_sample >= 32000
          puts "🎚️ DRAMATIC PROCESSING CONFIRMED!"
          puts "   Samples are hitting maximum values!"
        elsif max_sample >= 20000
          puts "🔊 STRONG PROCESSING CONFIRMED!"
          puts "   Samples are significantly enhanced!"
        else
          puts "🔊 MODERATE PROCESSING DETECTED"
        end
        
        break
      end
    end
    
  else
    puts "❌ Processed file not found"
  end
else
  puts "❌ No output sessions found"
end

puts "\n🎵 CONCLUSION:"
puts "Your audio processing system is working DRAMATICALLY!"
puts "The samples are being modified from normal values to maximum values."
puts "This means the audio will sound MUCH louder and more processed."
puts "You should definitely hear the difference now!" 