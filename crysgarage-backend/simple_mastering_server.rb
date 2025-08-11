#!/usr/bin/env ruby
# frozen_string_literal: true

# Simple Crys Garage Mastering Server (without master_audio dependency)
require 'json'
require 'sinatra'
require 'sinatra/cors'
require 'securerandom'
require 'fileutils'
require 'time'

class SimpleMasteringServer < Sinatra::Base
  register Sinatra::Cors

  set :port, 4567
  set :bind, '0.0.0.0'

  # Enable CORS
  set :allow_origin, "*"
  set :allow_methods, [:get, :post, :put, :delete, :options]
  set :allow_credentials, true
  set :allow_headers, ["*"]

  # Store processing sessions
  @@sessions = {}

  # Health check endpoint
  get '/health' do
    content_type :json
    { status: 'ok', service: 'crys-garage-mastering', version: '1.0.0' }.to_json
  end

  # Root endpoint
  get '/' do
    content_type :json
    { message: 'Crys Garage Mastering Server is running!' }.to_json
  end

  # Process audio file (simplified but realistic)
  post '/process' do
    content_type :json
    
    begin
      # Parse request body
      request_payload = JSON.parse(request.body.read)
      
      # Extract parameters
      input_file = request_payload['input_file']
      audio_id = request_payload['audio_id']
      genre = request_payload['genre'] || 'afrobeats'
      tier = request_payload['tier'] || 'professional'
      config = request_payload['config'] || {}
      
      # Generate session ID
      session_id = SecureRandom.uuid
      
      # Create session data
      @@sessions[session_id] = {
        session_id: session_id,
        audio_id: audio_id,
        input_file: input_file,
        genre: genre,
        tier: tier,
        config: config,
        status: 'processing',
        progress: 0,
        start_time: Time.now,
        current_step: 'Initializing...',
        steps: [
          'Analyzing audio...',
          'Applying noise reduction...',
          'EQ adjustment...',
          'Compression...',
          'Stereo enhancement...',
          'Limiting...',
          'Loudness normalization...',
          'Finalizing...'
        ],
        step_index: 0
      }
      
      # Start processing in background (simulated)
      Thread.new do
        simulate_processing(session_id)
      end
      
      {
        success: true,
        session_id: session_id,
        message: 'Processing started successfully'
      }.to_json
      
    rescue => e
      { error: "Processing failed: #{e.message}" }.to_json
    end
  end

  # Get processing status
  get '/status/:session_id' do
    content_type :json
    
    session_id = params[:session_id]
    session = @@sessions[session_id]
    
    if session
      {
        session_id: session_id,
        status: session[:status],
        progress: session[:progress],
        message: session[:current_step],
        metadata: {
          processing_time: session[:status] == 'done' ? (Time.now - session[:start_time]).to_i : 0,
          final_lufs: -14.2,
          true_peak: -0.8,
          dynamic_range: 12.5,
          genre: session[:genre],
          tier: session[:tier]
        }
      }.to_json
    else
      {
        session_id: session_id,
        status: 'not_found',
        progress: 0,
        error: 'Session not found'
      }.to_json
    end
  end

  # Download processed file
  get '/download/:session_id/:format' do
    content_type :json
    
    session_id = params[:session_id]
    format = params[:format]
    session = @@sessions[session_id]
    
    if session && session[:status] == 'done'
      {
        success: true,
        session_id: session_id,
        format: format,
        download_url: "/download/#{session_id}/#{format}",
        message: "Download ready for #{format} format"
      }.to_json
    else
      {
        error: 'File not ready for download',
        session_id: session_id,
        format: format
      }.to_json
    end
  end

  private

  def simulate_processing(session_id)
    session = @@sessions[session_id]
    return unless session
    
    steps = session[:steps]
    total_steps = steps.length
    
    steps.each_with_index do |step, index|
      # Update current step
      session[:current_step] = step
      session[:step_index] = index
      
      # Calculate progress (0-100)
      progress = ((index + 1) / total_steps.to_f * 100).round
      session[:progress] = progress
      
      # Simulate processing time (1-3 seconds per step)
      sleep_time = rand(1..3)
      sleep(sleep_time)
      
      # Log progress
      puts "Session #{session_id}: #{progress}% - #{step}"
    end
    
    # Mark as complete
    session[:status] = 'done'
    session[:progress] = 100
    session[:current_step] = 'Processing complete!'
    
    puts "Session #{session_id}: Processing completed successfully"
  end
end

# Start the server
if __FILE__ == $0
  puts "🎵 Simple Crys Garage Mastering Server"
  puts "======================================"
  puts "Starting server on port 4567..."
  puts "Health check: http://localhost:4567/health"
  puts "Process audio: POST http://localhost:4567/process"
  puts "Check status: GET http://localhost:4567/status/:session_id"
  puts "Download file: GET http://localhost:4567/download/:session_id/:format"
  puts ""

  SimpleMasteringServer.run!
end