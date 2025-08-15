FROM ruby:3.2-slim

# Install system dependencies with proper cleanup
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Update Ruby gems and install bundler
RUN gem update --system && \
    gem install bundler

WORKDIR /app

# Copy Gemfile
COPY Gemfile* ./

# Install Ruby gems with retry and proper error handling
RUN bundle config set --local deployment 'false' && \
    bundle config set --local force_ruby_platform true && \
    bundle install --jobs=4 --retry=3

# Copy application code
COPY . .

EXPOSE 4567

# Start Ruby service
CMD ["ruby", "simple_web_processor.rb", "-o", "0.0.0.0", "-p", "4567"] 