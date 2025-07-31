#!/bin/bash

echo "💎 Fixing Ruby Service for Ruby 2.5.0"
echo "====================================="

cd /var/www/crysgarage-deploy/crysgarage-ruby

# Remove problematic Gemfile.lock
rm -f Gemfile.lock

# Create a simple Gemfile that works with Ruby 2.5.0
cat > Gemfile << 'EOF'
source 'https://rubygems.org'

gem 'sinatra', '~> 2.0'
gem 'wavefile', '~> 0.8'
gem 'ruby-mp3info', '~> 0.8'
gem 'json'
EOF

# Install gems without bundler
gem install sinatra -v '~> 2.0'
gem install wavefile -v '~> 0.8'
gem install ruby-mp3info -v '~> 0.8'

# Create a simple Ruby service that doesn't need bundler
cat > simple_ruby_service.rb << 'EOF'
require 'sinatra'
require 'wavefile'
require 'ruby-mp3info'
require 'json'
require 'fileutils'

class SimpleRubyService < Sinatra::Base
  set :port, 4567
  set :bind, '0.0.0.0'
  
  # CORS headers
  before do
    headers 'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type'
  end

  options "*" do
    response.headers["Allow"] = "GET, PUT, POST, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token"
    response.headers["Access-Control-Allow-Origin"] = "*"
    200
  end

  get '/health' do
    content_type :json
    { status: 'healthy', timestamp: Time.now.to_s }.to_json
  end

  post '/process' do
    content_type :json
    
    begin
      # Create temp directory
      temp_dir = "/tmp/audio_processing_#{Time.now.to_i}"
      FileUtils.mkdir_p(temp_dir)
      
      # Get uploaded file
      file = params[:file]
      if file.nil?
        return { error: 'No file uploaded' }.to_json
      end
      
      input_path = File.join(temp_dir, file[:filename])
      File.open(input_path, 'wb') { |f| f.write(file[:tempfile].read) }
      
      # Process audio
      output_path = process_audio(input_path, temp_dir)
      
      # Return download link
      { 
        success: true, 
        download_url: "/download/#{File.basename(output_path)}",
        filename: File.basename(output_path)
      }.to_json
      
    rescue => e
      { error: e.message }.to_json
    end
  end

  get '/download/:filename' do
    file_path = "/tmp/#{params[:filename]}"
    if File.exist?(file_path)
      send_file file_path, disposition: :attachment
    else
      status 404
      "File not found"
    end
  end

  private

  def process_audio(input_path, temp_dir)
    # Read audio file
    reader = WaveFile::Reader.new(input_path)
    samples = reader.read.samples
    
    # Apply basic mastering
    processed_samples = apply_mastering(samples, reader.format)
    
    # Write output file
    output_path = File.join(temp_dir, "mastered_#{File.basename(input_path)}")
    writer = WaveFile::Writer.new(output_path, reader.format)
    writer.write(WaveFile::Buffer.new(processed_samples, reader.format))
    writer.close
    
    output_path
  end

  def apply_mastering(samples, format)
    # Simple volume boost and limiting
    max_sample = samples.flatten.map(&:abs).max
    return samples if max_sample == 0
    
    # Normalize to -0.2 dB
    target_level = 0.8
    gain = target_level / max_sample
    
    # Apply gain with soft limiting
    samples.map do |channel|
      channel.map do |sample|
        amplified = sample * gain
        # Soft limiting using tanh
        Math.tanh(amplified) * 0.8
      end
    end
  end
end

if __FILE__ == $0
  puts "Starting Simple Ruby Audio Service on port 4567..."
  puts "Ruby version: #{RUBY_VERSION}"
  SimpleRubyService.run!
end
EOF

# Update service file to use the simple Ruby service
cat > /etc/systemd/system/crysgarage-ruby.service << 'EOF'
[Unit]
Description=Crys Garage Ruby Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-ruby
ExecStart=/usr/bin/ruby simple_ruby_service.rb
Restart=always
RestartSec=10
Environment=RUBY_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and restart service
systemctl daemon-reload
systemctl restart crysgarage-ruby.service

echo "✅ Ruby service fixed!"
echo "Status: $(systemctl is-active crysgarage-ruby.service)" 