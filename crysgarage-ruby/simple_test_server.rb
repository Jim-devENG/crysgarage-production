#!/usr/bin/env ruby
# frozen_string_literal: true

require 'sinatra'
require 'sinatra/cors'
require 'json'

class SimpleTestServer < Sinatra::Base
  register Sinatra::Cors
  
  configure do
    enable :cors
    set :allow_origin, "*"
    set :allow_methods, [:get, :post, :put, :delete, :options]
    set :allow_credentials, true
    set :max_age, "1728000"
    set :expose_headers, ['Content-Type']
  end

  get '/' do
    "Simple Test Server Running!"
  end

  # Test the process_with_adjustments endpoint
  post '/process_with_adjustments' do
    content_type :json
    
    begin
      request_body = JSON.parse(request.body.read)
      original_audio_url = request_body['originalAudioUrl']
      file_name = request_body['fileName']
      adjustments = request_body['adjustments']
      
      puts "Received processing request:"
      puts "Original URL: #{original_audio_url}"
      puts "File name: #{file_name}"
      puts "Adjustments: #{adjustments.inspect}"
      
      # Mock response for testing
      {
        success: true,
        message: "Audio processed with exact adjustments (mock)",
        downloadUrl: "/download_exact_adjustments/test-session/#{file_name}",
        adjustments: adjustments
      }.to_json
      
    rescue JSON::ParserError => e
      {
        success: false,
        error: "Invalid JSON in request body: #{e.message}"
      }.to_json
    rescue => e
      puts "Error processing audio: #{e.message}"
      {
        success: false,
        error: "Processing failed: #{e.message}"
      }.to_json
    end
  end

  # Mock download endpoint
  get '/download_exact_adjustments/:session_id/:filename' do
    session_id = params[:session_id]
    filename = params[:filename]
    
    content_type 'application/octet-stream'
    attachment filename
    "Mock audio file content for #{filename}"
  end
end

puts "Starting Simple Test Server on port 4567..."
SimpleTestServer.run! 