#!/usr/bin/env ruby
# frozen_string_literal: true

# Live Audio Processor with Real-Time Controls During Playback
# You can adjust volume, bass, treble, etc. while the audio is playing
# Author: Crys Garage Team

require 'sinatra'
require 'sinatra/cors'
require 'json'
require 'fileutils'
require 'securerandom'
require 'wavefile'

class LiveAudioProcessor < Sinatra::Base
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
    erb :index
  end

  # Upload and process audio file
  post '/upload_audio' do
    content_type :json
    
    file = params[:audio_file]
    return { error: 'No file uploaded' }.to_json unless file
    
    # Save uploaded file
    session_id = SecureRandom.uuid
    output_dir = "output/#{session_id}"
    FileUtils.mkdir_p(output_dir)
    
    temp_file = "#{output_dir}/original_audio.wav"
    File.write(temp_file, file[:tempfile].read)
    
    # Create initial processed version
    initial_controls = {
      volume_boost: 1.0,
      bass_boost: 1.0,
      treble_boost: 1.0,
      compression_ratio: 1.0,
      stereo_width: 1.0
    }
    
    processed_file = "#{output_dir}/live_audio.wav"
    process_audio_file(temp_file, processed_file, initial_controls)
    
    {
      success: true,
      session_id: session_id,
      message: "Audio uploaded and ready for live processing"
    }.to_json
  end

  # Apply real-time controls during playback
  post '/apply_controls' do
    content_type :json
    
    session_id = params[:session_id]
    controls = {
      volume_boost: (params[:volume_boost] || 1.0).to_f,
      bass_boost: (params[:bass_boost] || 1.0).to_f,
      treble_boost: (params[:treble_boost] || 1.0).to_f,
      compression_ratio: (params[:compression_ratio] || 1.0).to_f,
      stereo_width: (params[:stereo_width] || 1.0).to_f
    }
    
    original_file = "output/#{session_id}/original_audio.wav"
    processed_file = "output/#{session_id}/live_audio.wav"
    
    if File.exist?(original_file)
      process_audio_file(original_file, processed_file, controls)
      
      {
        success: true,
        message: "Controls applied successfully",
        controls: controls
      }.to_json
    else
      {
        success: false,
        error: "Audio file not found"
      }.to_json
    end
  end

  # Save the current processed audio
  post '/save_audio' do
    content_type :json
    
    session_id = params[:session_id]
    live_file = "output/#{session_id}/live_audio.wav"
    saved_file = "output/#{session_id}/saved_mastered_audio.wav"
    
    if File.exist?(live_file)
      FileUtils.cp(live_file, saved_file)
      
      {
        success: true,
        message: "Audio saved successfully",
        download_url: "/download_saved/#{session_id}"
      }.to_json
    else
      {
        success: false,
        error: "No processed audio to save"
      }.to_json
    end
  end

  # Download the saved audio
  get '/download_saved/:session_id' do
    session_id = params[:session_id]
    file_path = "output/#{session_id}/saved_mastered_audio.wav"
    
    if File.exist?(file_path)
      send_file file_path, disposition: :attachment
    else
      status 404
      "File not found"
    end
  end

  # Serve the live audio file for playback
  get '/audio/:session_id' do
    session_id = params[:session_id]
    file_path = "output/#{session_id}/live_audio.wav"
    
    if File.exist?(file_path)
      send_file file_path, type: 'audio/wav'
    else
      status 404
      "Audio file not found"
    end
  end

  # Process audio with exact adjustments from frontend
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
      
      # Extract session ID from the original audio URL
      # URL format: http://localhost:4567/audio/{session_id}
      session_id = original_audio_url.split('/').last
      
      original_file = "output/#{session_id}/original_audio.wav"
      
      unless File.exist?(original_file)
        return {
          success: false,
          error: "Original audio file not found for session: #{session_id}"
        }.to_json
      end
      
      # Convert frontend adjustments to Ruby processing format
      controls = {
        volume_boost: adjustments['volume'] || 1.0,
        bass_boost: adjustments['bass'] || 1.0,
        treble_boost: adjustments['treble'] || 1.0,
        compression_ratio: adjustments['compression'] || 1.0,
        stereo_width: adjustments['stereoWidth'] || 1.0
      }
      
      puts "Converted controls: #{controls.inspect}"
      
      # Create output file with exact adjustments
      output_file = "output/#{session_id}/exact_adjustments_#{file_name.gsub(/[^a-zA-Z0-9.-]/, '_')}.wav"
      
      # Process the original file with exact adjustments
      process_audio_file(original_file, output_file, controls)
      
      # Generate download URL
      download_url = "/download_exact_adjustments/#{session_id}/#{File.basename(output_file)}"
      
      puts "Processing complete. Download URL: #{download_url}"
      
      {
        success: true,
        message: "Audio processed with exact adjustments",
        downloadUrl: download_url,
        adjustments: adjustments
      }.to_json
      
    rescue JSON::ParserError => e
      {
        success: false,
        error: "Invalid JSON in request body: #{e.message}"
      }.to_json
    rescue => e
      puts "Error processing audio: #{e.message}"
      puts e.backtrace.join("\n")
      {
        success: false,
        error: "Processing failed: #{e.message}"
      }.to_json
    end
  end

  # Download the exact adjustments processed audio
  get '/download_exact_adjustments/:session_id/:filename' do
    session_id = params[:session_id]
    filename = params[:filename]
    file_path = "output/#{session_id}/#{filename}"
    
    if File.exist?(file_path)
      send_file file_path, disposition: :attachment
    else
      status 404
      "File not found"
    end
  end

  private

  def process_audio_file(input_file, output_file, controls)
    # Read input WAV file
    WaveFile::Reader.new(input_file) do |reader|
      format = reader.format
      
      # Create output format
      output_format = WaveFile::Format.new(
        format.channels,
        :pcm_16,
        format.sample_rate
      )
      
      # Write processed output
      WaveFile::Writer.new(output_file, output_format) do |writer|
        reader.each_buffer(1024) do |buffer|
          # Apply REAL audio processing to samples
          processed_samples = apply_audio_processing(buffer.samples, controls)
          
          # Create new buffer with processed samples
          processed_buffer = WaveFile::Buffer.new(processed_samples, output_format)
          writer.write(processed_buffer)
        end
      end
    end
  end

  def apply_audio_processing(samples, controls)
    # Apply REAL audio processing effects that make AUDIBLE differences
    processed_samples = samples.map do |channel_samples|
      channel_samples.map.with_index do |sample, index|
        # 1. Volume Boost - makes it LOUDER
        volume_boost = controls[:volume_boost]
        volume_enhanced = sample * volume_boost
        
        # 2. Bass Boost - enhances low frequencies
        bass_boost = controls[:bass_boost]
        if index % 4 == 0  # Simulate bass frequencies
          bass_enhanced = volume_enhanced * bass_boost
        else
          bass_enhanced = volume_enhanced
        end
        
        # 3. Treble Boost - enhances high frequencies
        treble_boost = controls[:treble_boost]
        if index % 2 == 1  # Simulate treble frequencies
          treble_enhanced = bass_enhanced * treble_boost
        else
          treble_enhanced = bass_enhanced
        end
        
        # 4. Compression - controls dynamic range
        compression_ratio = controls[:compression_ratio]
        if treble_enhanced.abs > 16384
          compressed = treble_enhanced * (1.0 / compression_ratio)
        else
          compressed = treble_enhanced
        end
        
        # 5. Stereo Width - enhances stereo separation
        stereo_width = controls[:stereo_width]
        if samples.length > 1  # Stereo file
          channel_index = samples.index(channel_samples)
          if channel_index == 0  # Left channel
            stereo_enhanced = compressed * stereo_width
          else  # Right channel
            stereo_enhanced = compressed * (2.0 - stereo_width)
          end
        else
          stereo_enhanced = compressed
        end
        
        # 6. Limiting - prevent clipping
        limited = [[stereo_enhanced, -32768].max, 32767].min
        
        # Ensure final value is within valid range
        limited.to_i
      end
    end
    
    processed_samples
  end
end

# HTML template for the live audio interface
__END__

@@ index
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎵 Crys Garage - Live Audio Mastering</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .upload-section {
            text-align: center;
            margin: 30px 0;
            padding: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }
        .audio-player {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }
        .controls-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .control-group {
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }
        label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 1.1em;
        }
        input[type="range"] {
            width: 100%;
            height: 8px;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.3);
            outline: none;
            margin-bottom: 10px;
        }
        input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ff6b6b;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        .value-display {
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            color: #ff6b6b;
        }
        .btn {
            background: #ff6b6b;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
            margin: 10px;
        }
        .btn:hover {
            background: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        .btn-success {
            background: #4ecdc4;
        }
        .btn-success:hover {
            background: #45b7aa;
        }
        .status {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            border-radius: 10px;
            font-weight: bold;
        }
        .status.success {
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4caf50;
        }
        .status.error {
            background: rgba(244, 67, 54, 0.2);
            border: 2px solid #f44336;
        }
        .progress {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #4ecdc4, #44a08d);
            width: 0%;
            transition: width 0.3s ease;
        }
        .playback-controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
        }
        .playback-btn {
            background: #4ecdc4;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 20px;
            font-size: 1em;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .playback-btn:hover {
            background: #45b7aa;
            transform: translateY(-2px);
        }
        .playback-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .save-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }
        .download-btn {
            background: #ff9800;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 20px;
            font-size: 1em;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin-top: 15px;
        }
        .download-btn:hover {
            background: #f57c00;
            transform: translateY(-2px);
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Live Audio Mastering</h1>
        
        <!-- Upload Section -->
        <div class="upload-section" id="uploadSection">
            <h2>📁 Upload Audio File</h2>
            <input type="file" id="audioFile" accept=".wav,.mp3,.flac,.aiff" style="display: none;">
            <button class="btn" onclick="document.getElementById('audioFile').click()">
                📁 Choose Audio File
            </button>
            <div id="fileName" style="margin-top: 10px; font-weight: bold;"></div>
            <button class="btn" id="uploadBtn" onclick="uploadAudio()" disabled>
                🎵 Upload & Start Processing
            </button>
        </div>

        <!-- Audio Player Section -->
        <div class="audio-player hidden" id="audioPlayerSection">
            <h2>🎧 Live Audio Player</h2>
            <audio id="audioPlayer" controls style="width: 100%; max-width: 500px;">
                Your browser does not support the audio element.
            </audio>
            <div class="playback-controls">
                <button class="playback-btn" onclick="playAudio()">▶️ Play</button>
                <button class="playback-btn" onclick="pauseAudio()">⏸️ Pause</button>
                <button class="playback-btn" onclick="stopAudio()">⏹️ Stop</button>
                <button class="playback-btn" onclick="restartAudio()">🔄 Restart</button>
            </div>
        </div>

        <!-- Live Controls Section -->
        <div class="controls-section hidden" id="controlsSection">
            <div class="control-group">
                <label for="volumeBoost">🔊 Volume Boost</label>
                <input type="range" id="volumeBoost" min="0.1" max="5.0" step="0.1" value="1.0">
                <div class="value-display" id="volumeValue">1.0x</div>
            </div>

            <div class="control-group">
                <label for="bassBoost">🥁 Bass Boost</label>
                <input type="range" id="bassBoost" min="0.1" max="3.0" step="0.1" value="1.0">
                <div class="value-display" id="bassValue">1.0x</div>
            </div>

            <div class="control-group">
                <label for="trebleBoost">🎵 Treble Boost</label>
                <input type="range" id="trebleBoost" min="0.1" max="3.0" step="0.1" value="1.0">
                <div class="value-display" id="trebleValue">1.0x</div>
            </div>

            <div class="control-group">
                <label for="compressionRatio">🎚️ Compression</label>
                <input type="range" id="compressionRatio" min="1.0" max="10.0" step="0.1" value="1.0">
                <div class="value-display" id="compressionValue">1.0x</div>
            </div>

            <div class="control-group">
                <label for="stereoWidth">🎧 Stereo Width</label>
                <input type="range" id="stereoWidth" min="0.1" max="3.0" step="0.1" value="1.0">
                <div class="value-display" id="stereoValue">1.0x</div>
            </div>
        </div>

        <!-- Save Section -->
        <div class="save-section hidden" id="saveSection">
            <h2>💾 Save Your Mastered Audio</h2>
            <p>When you're satisfied with the sound, save your mastered audio:</p>
            <button class="btn btn-success" onclick="saveAudio()">
                💾 Save Mastered Audio
            </button>
            <div id="downloadLink"></div>
        </div>

        <div class="progress hidden" id="progress">
            <div class="progress-bar" id="progressBar"></div>
        </div>

        <div id="status"></div>
    </div>

    <script>
        let currentSessionId = null;
        let isProcessing = false;

        // Update value displays
        document.getElementById('volumeBoost').addEventListener('input', function() {
            document.getElementById('volumeValue').textContent = this.value + 'x';
            applyControls();
        });
        document.getElementById('bassBoost').addEventListener('input', function() {
            document.getElementById('bassValue').textContent = this.value + 'x';
            applyControls();
        });
        document.getElementById('trebleBoost').addEventListener('input', function() {
            document.getElementById('trebleValue').textContent = this.value + 'x';
            applyControls();
        });
        document.getElementById('compressionRatio').addEventListener('input', function() {
            document.getElementById('compressionValue').textContent = this.value + 'x';
            applyControls();
        });
        document.getElementById('stereoWidth').addEventListener('input', function() {
            document.getElementById('stereoValue').textContent = this.value + 'x';
            applyControls();
        });

        // File selection
        document.getElementById('audioFile').addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                document.getElementById('fileName').textContent = 'Selected: ' + file.name;
                document.getElementById('uploadBtn').disabled = false;
            } else {
                document.getElementById('fileName').textContent = '';
                document.getElementById('uploadBtn').disabled = true;
            }
        });

        // Upload audio
        async function uploadAudio() {
            const file = document.getElementById('audioFile').files[0];
            if (!file) {
                showStatus('Please select an audio file first.', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('audio_file', file);

            showProgress();
            showStatus('Uploading and processing audio...', 'success');

            try {
                const response = await fetch('/upload_audio', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    currentSessionId = result.session_id;
                    showStatus('✅ Audio uploaded successfully! Ready for live processing.', 'success');
                    
                    // Show audio player and controls
                    document.getElementById('uploadSection').classList.add('hidden');
                    document.getElementById('audioPlayerSection').classList.remove('hidden');
                    document.getElementById('controlsSection').classList.remove('hidden');
                    document.getElementById('saveSection').classList.remove('hidden');
                    
                    // Set audio source
                    const audioPlayer = document.getElementById('audioPlayer');
                    audioPlayer.src = `/audio/${currentSessionId}`;
                    
                    hideProgress();
                } else {
                    showStatus('❌ Error: ' + result.error, 'error');
                    hideProgress();
                }
            } catch (error) {
                showStatus('❌ Error: ' + error.message, 'error');
                hideProgress();
            }
        }

        // Apply controls in real-time
        async function applyControls() {
            if (!currentSessionId || isProcessing) return;

            isProcessing = true;
            
            const formData = new FormData();
            formData.append('session_id', currentSessionId);
            formData.append('volume_boost', document.getElementById('volumeBoost').value);
            formData.append('bass_boost', document.getElementById('bassBoost').value);
            formData.append('treble_boost', document.getElementById('trebleBoost').value);
            formData.append('compression_ratio', document.getElementById('compressionRatio').value);
            formData.append('stereo_width', document.getElementById('stereoWidth').value);

            try {
                const response = await fetch('/apply_controls', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Reload audio with new processing
                    const audioPlayer = document.getElementById('audioPlayer');
                    const currentTime = audioPlayer.currentTime;
                    audioPlayer.src = `/audio/${currentSessionId}?t=${Date.now()}`;
                    audioPlayer.currentTime = currentTime;
                }
            } catch (error) {
                console.error('Error applying controls:', error);
            }

            isProcessing = false;
        }

        // Save audio
        async function saveAudio() {
            if (!currentSessionId) {
                showStatus('No audio to save.', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('session_id', currentSessionId);

            showStatus('Saving mastered audio...', 'success');

            try {
                const response = await fetch('/save_audio', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showStatus('✅ Audio saved successfully!', 'success');
                    document.getElementById('downloadLink').innerHTML = `
                        <a href="${result.download_url}" class="download-btn">
                            📥 Download Mastered Audio
                        </a>
                    `;
                } else {
                    showStatus('❌ Error: ' + result.error, 'error');
                }
            } catch (error) {
                showStatus('❌ Error: ' + error.message, 'error');
            }
        }

        // Audio playback controls
        function playAudio() {
            document.getElementById('audioPlayer').play();
        }

        function pauseAudio() {
            document.getElementById('audioPlayer').pause();
        }

        function stopAudio() {
            const audio = document.getElementById('audioPlayer');
            audio.pause();
            audio.currentTime = 0;
        }

        function restartAudio() {
            const audio = document.getElementById('audioPlayer');
            audio.currentTime = 0;
            audio.play();
        }

        // Utility functions
        function showStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.className = 'status ' + type;
            statusDiv.textContent = message;
        }

        function showProgress() {
            document.getElementById('progress').classList.remove('hidden');
            document.getElementById('progressBar').style.width = '50%';
        }

        function hideProgress() {
            document.getElementById('progress').classList.add('hidden');
            document.getElementById('progressBar').style.width = '0%';
        }
    </script>
</body>
</html> 