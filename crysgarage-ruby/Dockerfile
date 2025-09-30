FROM ruby:3.2-slim

# Install system dependencies with proper cleanup
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    libffi-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Update Ruby gems and install bundler
RUN gem update --system && \
    gem install bundler

WORKDIR /app

# Copy Gemfile
COPY Gemfile* ./

# Clean up any merge conflicts in Gemfile.lock if they exist
RUN if grep -q "<<<<<<< HEAD" Gemfile.lock; then \
        echo "Removing merge conflicts from Gemfile.lock"; \
        sed -i '/<<<<<<< HEAD/,/>>>>>>> /d' Gemfile.lock; \
        sed -i '/=======/d' Gemfile.lock; \
    fi

# Install Ruby gems with retry and proper error handling
RUN bundle config set --local deployment 'false' && \
    bundle config set --local force_ruby_platform true && \
    bundle config set --local build.ffi --use-system-libraries && \
    bundle install --jobs=4 --retry=3 --verbose

# Copy application code
COPY . .

EXPOSE 4567

# Start Ruby service
CMD ["ruby", "simple_web_processor.rb", "-o", "0.0.0.0", "-p", "4567"] 