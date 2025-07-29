#!/usr/bin/env ruby
# frozen_string_literal: true

# Simple test server to verify Sinatra works
require 'json'
require 'sinatra'
require 'sinatra/cors'

class TestServer < Sinatra::Base
  register Sinatra::Cors

  set :port, 4568
  set :bind, '0.0.0.0'

  # Enable CORS
  set :allow_origin, "*"
  set :allow_methods, [:get, :post, :put, :delete, :options]
  set :allow_credentials, true
  set :allow_headers, ["*"]

  # Health check endpoint
  get '/health' do
    content_type :json
    { status: 'ok', service: 'test-server', version: '1.0.0' }.to_json
  end

  # Root endpoint
  get '/' do
    content_type :json
    { message: 'Test server is running!' }.to_json
  end
end

# Start the server
if __FILE__ == $0
  puts "🧪 Test Server Starting..."
  puts "Health check: http://localhost:4568/health"
  puts ""
  TestServer.run!
end