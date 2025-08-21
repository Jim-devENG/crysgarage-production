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
require 'thread'
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
  
  # Cleanup configuration
  CLEANUP_INTERVAL = 60  # Check every 60 seconds
  FILE_LIFETIME = 300    # Delete files after 5 minutes (300 seconds)
  
  # Thread-safe session tracking
  @@sessions = {}
  @@sessions_mutex = Mutex.new
  
  # Start cleanup thread
  Thread.new do
    loop do
      cleanup_old_files
      sleep CLEANUP_INTERVAL
    end
  end
  
  # Cleanup old audio files
  def cleanup_old_files
    current_time = Time.now
    
    @@sessions_mutex.synchronize do
      @@sessions.each do |session_id, created_time|
        if current_time - created_time > FILE_LIFETIME
          cleanup_session(session_id)
          @@sessions.delete(session_id)
        end
      end
    end
    
    # Also cleanup any orphaned directories
    cleanup_orphaned_directories
  end
  
  # Cleanup a specific session
  def cleanup_session(session_id)
    session_dir = "output/#{session_id}"
    temp_dir = "temp_uploads"
    
    begin
      # Remove session directory
      if Dir.exist?(session_dir)
        FileUtils.rm_rf(session_dir)
        log_info("Cleaned up session: #{session_id}")
      end
      
      # Remove any temp files for this session
      Dir.glob("#{temp_dir}/*#{session_id}*").each do |file|
        FileUtils.rm_f(file)
      end
      
    rescue => e
      log_error("Error cleaning up session #{session_id}: #{e.message}")
    end
  end
  
  # Cleanup orphaned directories
  def cleanup_orphaned_directories
    current_time = Time.now
    
    # Cleanup old output directories
    if Dir.exist?("output")
      Dir.entries("output").each do |entry|
        next if entry == "." || entry == ".."
        
        dir_path = "output/#{entry}"
        if Dir.exist?(dir_path)
          # Check if directory is older than 5 minutes
          dir_time = File.mtime(dir_path)
          if current_time - dir_time > FILE_LIFETIME
            FileUtils.rm_rf(dir_path)
            log_info("Cleaned up orphaned directory: #{entry}")
          end
        end
      end
    end
    
    # Cleanup old temp files
    if Dir.exist?("temp_uploads")
      Dir.entries("temp_uploads").each do |entry|
        next if entry == "." || entry == ".."
        
        file_path = "temp_uploads/#{entry}"
        if File.exist?(file_path)
          # Check if file is older than 5 minutes
          file_time = File.mtime(file_path)
          if current_time - file_time > FILE_LIFETIME
            FileUtils.rm_f(file_path)
            log_info("Cleaned up temp file: #{entry}")
          end
        end
      end
    end
  end
  
  # Logging functions
  def log_info(message, data = nil)
    timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = "[#{timestamp}] INFO: #{message}"
    log_entry += " | Data: #{data.to_json}" if data
    puts log_entry
  end
  
  def log_error(message)
    timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
    puts "[#{timestamp}] ERROR: #{message}"
  end
  
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
      genre_specific_processing: true,
      auto_cleanup: true,
      file_lifetime_minutes: FILE_LIFETIME / 60,
      active_sessions: @@sessions_mutex.synchronize { @@sessions.size }
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
        # Track session for cleanup
        session_id = result[:session_id]
        @@sessions_mutex.synchronize do
          @@sessions[session_id] = Time.now
        end
        
        log_info("Created session for cleanup tracking: #{session_id}")
        
        {
          success: true,
          session_id: session_id,
          audio_id: audio_id,
          output_files: result[:output_files],
          processing_time: result[:processing_time],
          report: result[:report],
          metadata: result[:metadata],
          cleanup_info: {
            auto_cleanup: true,
            lifetime_minutes: FILE_LIFETIME / 60,
            cleanup_time: (Time.now + FILE_LIFETIME).iso8601
          }
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
    
    # Reset cleanup timer for this session when downloaded
    @@sessions_mutex.synchronize do
      @@sessions[session_id] = Time.now if @@sessions[session_id]
    end
    
    send_file file_path, disposition: 'attachment'
  end
  
  # Manual cleanup endpoint (for testing)
  post '/cleanup/:session_id' do
    session_id = params[:session_id]
    
    @@sessions_mutex.synchronize do
      @@sessions.delete(session_id)
    end
    
    cleanup_session(session_id)
    
    { success: true, message: "Session #{session_id} cleaned up manually" }.to_json
  end
  
  # Get cleanup status
  get '/cleanup/status' do
    content_type :json
    
    @@sessions_mutex.synchronize do
      {
        active_sessions: @@sessions.size,
        sessions: @@sessions.map { |id, time| 
          {
            session_id: id,
            created: time.iso8601,
            age_seconds: (Time.now - time).to_i,
            will_cleanup_in: FILE_LIFETIME - (Time.now - time).to_i
          }
        }
      }.to_json
    end
  end
  
  # Start the server
  if __FILE__ == $0
    puts "🎵 Crys Garage Mastering Server (ENHANCED PROCESSING + AUTO CLEANUP)"
    puts "===================================================================="
    puts "Starting server on port 4567..."
    puts "Health check: http://localhost:4567/health"
    puts "Process audio: POST http://localhost:4567/process"
    puts "Check status: GET http://localhost:4567/status/:session_id"
    puts "Download file: GET http://localhost:4567/download/:session_id/:format"
    puts "Cleanup status: GET http://localhost:4567/cleanup/status"
    puts ""
    puts "Enhanced audio processing: ENABLED"
    puts "Real file analysis: ENABLED"
    puts "Genre-specific processing: ENABLED"
    puts "Auto cleanup: ENABLED (#{FILE_LIFETIME / 60} minutes)"
    puts "Supported formats: WAV, MP3, FLAC, AIFF"
    puts "Processing steps: Noise Reduction, EQ, Compression, Stereo Enhancement, Limiting, Loudness Normalization"
    puts ""
    
    Sinatra::Application.run!
  end
end 