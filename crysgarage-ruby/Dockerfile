FROM ruby:3.2-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Gemfile
COPY Gemfile* ./

# Install Ruby gems
RUN bundle install

# Copy application code
COPY . .

EXPOSE 4567

# Start Ruby service
CMD ["ruby", "simple_web_processor.rb", "-o", "0.0.0.0", "-p", "4567"] 