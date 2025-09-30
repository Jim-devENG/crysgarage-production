#!/usr/bin/env ruby
# frozen_string_literal: true

# Test script for the /process_with_adjustments endpoint
require 'net/http'
require 'json'
require 'uri'

puts "🧪 Testing /process_with_adjustments endpoint..."

# Test data
test_request = {
  originalAudioUrl: "http://localhost:4567/audio/test-session-123",
  fileName: "test_audio.wav",
  adjustments: {
    volume: 2.0,
    bass: 1.5,
    treble: 1.8,
    compression: 3.0,
    stereoWidth: 1.2
  }
}

puts "📤 Sending test request:"
puts JSON.pretty_generate(test_request)

begin
  # Create HTTP request
  uri = URI('http://localhost:4567/process_with_adjustments')
  http = Net::HTTP.new(uri.host, uri.port)
  
  request = Net::HTTP::Post.new(uri)
  request['Content-Type'] = 'application/json'
  request.body = test_request.to_json
  
  # Send request
  puts "\n📡 Sending request to #{uri}..."
  response = http.request(request)
  
  puts "📥 Response status: #{response.code}"
  puts "📥 Response body:"
  puts response.body
  
  if response.code == '200'
    result = JSON.parse(response.body)
    if result['success']
      puts "✅ Test PASSED! Endpoint is working correctly."
      puts "📁 Download URL: #{result['downloadUrl']}"
    else
      puts "❌ Test FAILED! Endpoint returned error: #{result['error']}"
    end
  else
    puts "❌ Test FAILED! HTTP #{response.code}"
  end
  
rescue => e
  puts "❌ Test FAILED! Exception: #{e.message}"
  puts e.backtrace.first(5)
end

puts "\n�� Test completed!" 