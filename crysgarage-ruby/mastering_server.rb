#!/usr/bin/env ruby
# frozen_string_literal: true

# Crys Garage Mastering Server
# HTTP server for audio mastering requests
# Author: Crys Garage Team
# Version: 1.0.0

require 'json'
require 'sinatra'
require 'sinatra/cors'
require 'fileutils'
require 'time'
require 'securerandom'
require_relative 'enhanced_audio_processor'

class MasteringServer < Sinatra::Base
  register Sinatra::Cors
  
  set :port, 4567
  set :bind, '0.0.0.0'
  
  # Enable CORS
  set :allow_origin, "*"
  set :allow_methods, [:get, :post, :put, :delete, :options]
  set :allow_credentials, true
  set :allow_headers, ["*"]
  
  # Initialize the enhanced mastering engine
  @@mastering_engine = EnhancedAudioProcessor.new
  
  # Health check endpoint
  get '/health' do
    content_type :json
    { 
      status: 'ok', 
      service: 'crys-garage-mastering', 
      version: '1.0.0',
      enhanced_processing: true,
      capabilities: ['noise_reduction', 'eq_adjustment', 'compression', 'stereo_enhancement', 'limiting', 'loudness_normalization'],
      real_file_analysis: true,
      genre_specific_processing: true
    }.to_json
  end
  
  # Process audio file
  post '/process' do
    content_type :json
    
    begin
      # Parse request body
      request_payload = JSON.parse(request.body.read)
      
      # Extract parameters
      input_file = request_payload['file_path'] || request_payload['input_file']
      audio_id = request_payload['audio_id']
      genre = request_payload['genre'] || 'afrobeats'
      tier = request_payload['tier'] || 'professional'
      config = request_payload['config'] || {}
      
      # Validate input file
      unless File.exist?(input_file)
        return { error: 'Input file not found', file: input_file }.to_json
      end
      
      # Create processing configuration
      processing_config = {
        genre: genre,
        tier: tier,
        target_lufs: config['target_lufs'] || -14.0,
        true_peak: config['true_peak'] || -1.0,
        sample_rate: config['sample_rate'] || 44100,
        bit_depth: config['bit_depth'] || 24
      }
      
      # Process the audio with enhanced mastering
      result = @@mastering_engine.process_audio(input_file, processing_config)
      
      if result[:success]
        {
          success: true,
          session_id: result[:session_id],
          audio_id: audio_id,
          output_files: result[:output_files],
          processing_time: result[:processing_time],
          report: result[:report],
          metadata: result[:metadata]
        }.to_json
      else
        { error: result[:error], session_id: result[:session_id], audio_id: audio_id }.to_json
      end
      
    rescue => e
      { error: "Processing failed: #{e.message}" }.to_json
    end
  end
  
  # Get processing status
  get '/status/:session_id' do
    content_type :json
    
    session_id = params[:session_id]
    
    # Check if session exists
    session_dir = "output/#{session_id}"
    
    unless Dir.exist?(session_dir)
      return { error: 'Session not found' }.to_json
    end
    
    # Check for progress file
    progress_file = "#{session_dir}/progress.json"
    if File.exist?(progress_file)
      progress_data = JSON.parse(File.read(progress_file))
      return progress_data.to_json
    end
    
    # Check for output files
    output_files = {}
    ['wav', 'mp3', 'flac'].each do |format|
      file_path = "#{session_dir}/mastered.#{format}"
      if File.exist?(file_path)
        output_files[format] = file_path
      end
    end
    
    if output_files.empty?
      { status: 'processing', progress: 50 }
    else
      { 
        status: 'done', 
        progress: 100,
        output_files: output_files
      }
    end.to_json
  end
  
  # Download processed file
  get '/download/:session_id/:format' do
    session_id = params[:session_id]
    format = params[:format]
    
    file_path = "output/#{session_id}/mastered.#{format}"
    
    unless File.exist?(file_path)
      return { error: 'File not found' }.to_json
    end
    
    send_file file_path, disposition: 'attachment'
  end
  
  # Start the server
  if __FILE__ == $0
    puts "🎵 Crys Garage Mastering Server (ENHANCED PROCESSING)"
    puts "====================================================="
    puts "Starting server on port 4567..."
    puts "Health check: http://localhost:4567/health"
    puts "Process audio: POST http://localhost:4567/process"
    puts "Check status: GET http://localhost:4567/status/:session_id"
    puts "Download file: GET http://localhost:4567/download/:session_id/:format"
    puts ""
    puts "Enhanced audio processing: ENABLED"
    puts "Real file analysis: ENABLED"
    puts "Genre-specific processing: ENABLED"
    puts "Supported formats: WAV, MP3, FLAC, AIFF"
    puts "Processing steps: Noise Reduction, EQ, Compression, Stereo Enhancement, Limiting, Loudness Normalization"
    puts ""
    
    Sinatra::Application.run!
  end
end 