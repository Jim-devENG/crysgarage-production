#!/bin/bash

# Load RVM environment
source /usr/local/rvm/scripts/rvm

# Set working directory
cd /var/www/crysgarage/crysgarage-ruby

# Start the Ruby mastering server
exec bundle exec ruby simple_mastering_server.rb