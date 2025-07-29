#!/bin/bash

# Crys Garage Ruby Server Startup Script
# This script ensures proper environment setup for the Ruby mastering server

# Set the working directory
cd /var/www/crysgarage/crysgarage-ruby

# Load RVM environment
source /usr/local/rvm/scripts/rvm

# Set Ruby version
rvm use 3.0.0

# Ensure output directory exists
mkdir -p output

# Start the Ruby server
exec /usr/local/rvm/gems/ruby-3.0.0/bin/bundle exec ruby mastering_server.rb