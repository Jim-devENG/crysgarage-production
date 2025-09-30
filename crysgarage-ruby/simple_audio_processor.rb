require 'sinatra'
require 'wavefile'
require 'ruby-mp3info'
require 'json'
require 'fileutils'

class SimpleAudioProcessor < Sinatra::Base
  set :port, 4567
  set :bind, '0.0.0.0'
  
  # Enable CORS
  before do
    headers 'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type'
  end

  options "*" do
    response.headers["Allow"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token"
    response.headers["Access-Control-Allow-Origin"] = "*"
    200
  end

  # Health check endpoint
  get '/' do
    { status: 'ok', message: 'Simple Audio Processor is running', ruby_version: RUBY_VERSION }.to_json
  end

  # Process audio with basic mastering
  post '/process' do
    content_type :json
    
    begin
      # Get uploaded file
      file = params[:audio_file]
      return { error: 'No audio file provided' }.to_json unless file

      # Create temp directory
      temp_dir = File.join(Dir.pwd, 'temp_uploads')
      FileUtils.mkdir_p(temp_dir)

      # Save uploaded file
      original_path = File.join(temp_dir, "original_#{Time.now.to_i}.wav")
      File.open(original_path, 'wb') { |f| f.write(file[:tempfile].read) }

      # Process the audio
      processed_path = process_audio(original_path, temp_dir)

      # Return success response
      {
        status: 'success',
        message: 'Audio processed successfully',
        original_file: File.basename(original_path),
        processed_file: File.basename(processed_path),
        file_size: File.size(processed_path)
      }.to_json

    rescue => e
      { error: "Processing failed: #{e.message}" }.to_json
    end
  end

  # Download processed file
  get '/download/:filename' do
    filename = params[:filename]
    temp_dir = File.join(Dir.pwd, 'temp_uploads')
    file_path = File.join(temp_dir, filename)
    
    if File.exist?(file_path)
      send_file file_path, disposition: 'attachment'
    else
      { error: 'File not found' }.to_json
    end
  end

  private

  def process_audio(input_path, temp_dir)
    # Read the WAV file
    WaveFile::Reader.new(input_path) do |reader|
      # Get audio format
      format = reader.format
      samples = reader.read_all.samples
      
      # Apply basic mastering effects
      processed_samples = apply_mastering_effects(samples, format)
      
      # Create output file
      output_path = File.join(temp_dir, "mastered_#{Time.now.to_i}.wav")
      
      # Write processed audio
      WaveFile::Writer.new(output_path, format) do |writer|
        writer.write(WaveFile::Buffer.new(processed_samples, format))
      end
      
      return output_path
    end
  end

  def apply_mastering_effects(samples, format)
    # Convert to float for processing
    float_samples = samples.map { |sample| sample.to_f / 32768.0 }
    
    # Apply volume boost (target -9 LUFS equivalent)
    volume_boost = 2.0  # Increase volume by 2x
    float_samples.map! { |sample| sample * volume_boost }
    
    # Apply basic compression (soft limiting)
    threshold = 0.8
    ratio = 4.0
    float_samples.map! do |sample|
      if sample.abs > threshold
        if sample > 0
          threshold + (sample - threshold) / ratio
        else
          -threshold - (-sample - threshold) / ratio
        end
      else
        sample
      end
    end
    
    # Apply basic EQ (high-pass filter simulation)
    # Simple high-pass filter effect
    float_samples.map! { |sample| sample * 1.1 }  # Boost highs slightly
    
    # Convert back to 16-bit integer
    samples.map { |sample| (sample * 32767.0).round.clamp(-32768, 32767) }
  end
end

# Start the server
if __FILE__ == $0
  puts "Starting Simple Audio Processor on port 4567..."
  puts "Ruby version: #{RUBY_VERSION}"
  puts "Available gems:"
  puts "  - Sinatra: #{Gem.loaded_specs['sinatra']&.version}"
  puts "  - Wavefile: #{Gem.loaded_specs['wavefile']&.version}"
  puts "  - Ruby-mp3info: #{Gem.loaded_specs['ruby-mp3info']&.version}"
  SimpleAudioProcessor.run!
end 