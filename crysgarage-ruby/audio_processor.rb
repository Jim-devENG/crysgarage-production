#!/usr/bin/env ruby
# frozen_string_literal: true

require 'sinatra'
require 'json'
require 'fileutils'
require_relative 'master_audio'

class AudioProcessor < Sinatra::Base
  set :port, 4567
  set :bind, '0.0.0.0'
  
  # Enable CORS
  before do
    headers 'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type'
  end
  
  options "*" do
    response.headers["Allow"] = "GET, POST, OPTIONS"
    200
  end

  # Health check endpoint
  get '/' do
    { status: 'ok', service: 'Crys Garage Audio Processor', version: '1.0.0' }.to_json
  end

  # Process audio endpoint
  post '/process' do
    content_type :json
    
    begin
      data = JSON.parse(request.body.read)
      
      input_file = data['input_file']
      audio_id = data['audio_id']
      genre = data['genre'] || 'pop'
      tier = data['tier'] || 'professional'
      config = data['config'] || {}
      
      # Validate input file
      unless File.exist?(input_file)
        return { error: 'Input file not found', audio_id: audio_id }.to_json
      end
      
      # Create processing configuration
      processing_config = {
        sample_rate: config['sample_rate'] || 44100,
        bit_depth: config['bit_depth'] || 24,
        target_lufs: config['target_lufs'] || -14.0,
        true_peak: config['true_peak'] || -1.0,
        genre: genre,
        tier: tier,
        eq_settings: config['eq_settings'] || {},
        compression_settings: config['compression_settings'] || {},
        stereo_width: config['stereo_width'] || 1.0,
        processing_steps: config['processing_steps'] || [
          'noise_reduction',
          'eq_adjustment',
          'compression',
          'stereo_enhancement',
          'limiting',
          'loudness_normalization'
        ]
      }
      
      # Initialize mastering engine
      mastering = CrysGarageMastering.new(processing_config)
      
      # Process the audio
      result = mastering.process_audio(input_file, config)
      
      if result[:success]
        {
          success: true,
          session_id: mastering.session_id,
          audio_id: audio_id,
          output_files: result[:output_files],
          metadata: result[:metadata],
          processing_time: result[:processing_time]
        }.to_json
      else
        {
          success: false,
          error: result[:error],
          session_id: mastering.session_id,
          audio_id: audio_id
        }.to_json
      end
      
    rescue => e
      {
        success: false,
        error: e.message,
        audio_id: audio_id
      }.to_json
    end
  end

  # Get processing status
  get '/status/:session_id' do
    content_type :json
    
    session_id = params[:session_id]
    progress_file = "output/#{session_id}/progress.json"
    
    if File.exist?(progress_file)
      progress_data = JSON.parse(File.read(progress_file))
      
      {
        session_id: session_id,
        status: 'processing',
        progress: progress_data['progress'] || 0,
        message: progress_data['message'] || 'Processing...',
        timestamp: progress_data['timestamp']
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

  # Get processing result
  get '/result/:session_id' do
    content_type :json
    
    session_id = params[:session_id]
    output_dir = "output/#{session_id}"
    
    if Dir.exist?(output_dir)
      result_files = Dir.glob("#{output_dir}/*.{wav,mp3,flac}")
      
      {
        session_id: session_id,
        status: 'done',
        output_files: result_files.map { |f| File.basename(f) },
        download_urls: result_files.map { |f| "/download/#{session_id}/#{File.basename(f)}" }
      }.to_json
    else
      {
        session_id: session_id,
        status: 'not_found',
        error: 'Result not found'
      }.to_json
    end
  end

  # Download processed file
  get '/download/:session_id/:filename' do
    session_id = params[:session_id]
    filename = params[:filename]
    file_path = "output/#{session_id}/#{filename}"
    
    if File.exist?(file_path)
      send_file file_path
    else
      status 404
      { error: 'File not found' }.to_json
    end
  end
end

# Start the server
if __FILE__ == $0
  puts "🎵 Starting Crys Garage Audio Processor on port 4567..."
  AudioProcessor.run!
end 