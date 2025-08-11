#!/usr/bin/env ruby
# frozen_string_literal: true

puts "Testing master_audio.rb loading..."

begin
  require_relative 'master_audio'
  puts "✅ master_audio.rb loaded successfully!"
  
  # Try to create an instance
  engine = CrysGarageMastering.new
  puts "✅ CrysGarageMastering instance created successfully!"
  
rescue => e
  puts "❌ Error loading master_audio.rb: #{e.message}"
  puts "Backtrace:"
  puts e.backtrace.first(5)
end