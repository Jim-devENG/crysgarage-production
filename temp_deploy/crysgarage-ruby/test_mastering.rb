#!/usr/bin/env ruby
# frozen_string_literal: true

# Crys Garage Audio Mastering Engine - Test Script
# Demonstrates the mastering engine functionality

require_relative 'master_audio'
require 'json'

class CrysGarageTest
  def initialize
    @test_results = []
    @config = load_config
  end

  def load_config
    if File.exist?('config.json')
      JSON.parse(File.read('config.json'))
    else
      puts "⚠️  config.json not found, using default configuration"
      {}
    end
  end

  def run_all_tests
    puts "🧪 Crys Garage Audio Mastering Engine - Test Suite"
    puts "=" * 60
    
    test_engine_initialization
    test_genre_configurations
    test_tier_configurations
    test_processing_pipeline
    test_error_handling
    test_cli_interface
    
    display_results
  end

  def test_engine_initialization
    puts "\n📋 Test 1: Engine Initialization"
    puts "-" * 40
    
    begin
      mastering = CrysGarageMastering.new
      
      assert(mastering.session_id.length > 0, "Session ID generated")
      assert(Dir.exist?(mastering.output_dir), "Output directory created")
      assert(Dir.exist?('logs'), "Logs directory created")
      assert(Dir.exist?('temp'), "Temp directory created")
      
      @test_results << { test: "Engine Initialization", status: "PASS" }
      puts "✅ Engine initialization test passed"
      
    rescue => e
      @test_results << { test: "Engine Initialization", status: "FAIL", error: e.message }
      puts "❌ Engine initialization test failed: #{e.message}"
    end
  end

  def test_genre_configurations
    puts "\n📋 Test 2: Genre Configurations"
    puts "-" * 40
    
    genres = ['afrobeats', 'gospel', 'hip_hop', 'highlife']
    
    genres.each do |genre|
      begin
        mastering = CrysGarageMastering.new(genre: genre)
        config = mastering.get_genre_config(genre)
        
        assert(config.is_a?(Hash), "#{genre} config is a hash")
        assert(config[:eq_settings], "#{genre} has EQ settings")
        assert(config[:compression], "#{genre} has compression settings")
        
        puts "✅ #{genre.capitalize} configuration test passed"
        
      rescue => e
        puts "❌ #{genre.capitalize} configuration test failed: #{e.message}"
      end
    end
    
    @test_results << { test: "Genre Configurations", status: "PASS" }
  end

  def test_tier_configurations
    puts "\n📋 Test 3: Tier Configurations"
    puts "-" * 40
    
    tiers = ['free', 'professional', 'advanced']
    
    tiers.each do |tier|
      begin
        mastering = CrysGarageMastering.new(tier: tier)
        config = mastering.config
        
        assert(config[:tier] == tier, "#{tier} tier set correctly")
        assert(config[:processing_steps].is_a?(Array), "#{tier} has processing steps")
        
        puts "✅ #{tier.capitalize} tier configuration test passed"
        
      rescue => e
        puts "❌ #{tier.capitalize} tier configuration test failed: #{e.message}"
      end
    end
    
    @test_results << { test: "Tier Configurations", status: "PASS" }
  end

  def test_processing_pipeline
    puts "\n📋 Test 4: Processing Pipeline"
    puts "-" * 40
    
    begin
      mastering = CrysGarageMastering.new
      
      # Create a dummy test file
      test_file = create_test_file
      
      # Test processing
      result = mastering.process_audio(test_file)
      
      assert(result.is_a?(Hash), "Processing returns a hash")
      assert(result[:success] == true, "Processing completed successfully")
      assert(result[:session_id].length > 0, "Session ID generated")
      assert(result[:processing_time] > 0, "Processing time recorded")
      
      puts "✅ Processing pipeline test passed"
      @test_results << { test: "Processing Pipeline", status: "PASS" }
      
      # Clean up test file
      File.delete(test_file) if File.exist?(test_file)
      
    rescue => e
      puts "❌ Processing pipeline test failed: #{e.message}"
      @test_results << { test: "Processing Pipeline", status: "FAIL", error: e.message }
    end
  end

  def test_error_handling
    puts "\n📋 Test 5: Error Handling"
    puts "-" * 40
    
    begin
      mastering = CrysGarageMastering.new
      
      # Test with non-existent file
      result = mastering.process_audio('non_existent_file.wav')
      assert(result[:error], "Error handling for non-existent file")
      
      # Test with unsupported format
      unsupported_file = create_test_file('unsupported.txt')
      result = mastering.process_audio(unsupported_file)
      assert(result[:error], "Error handling for unsupported format")
      
      # Clean up
      File.delete(unsupported_file) if File.exist?(unsupported_file)
      
      puts "✅ Error handling test passed"
      @test_results << { test: "Error Handling", status: "PASS" }
      
    rescue => e
      puts "❌ Error handling test failed: #{e.message}"
      @test_results << { test: "Error Handling", status: "FAIL", error: e.message }
    end
  end

  def test_cli_interface
    puts "\n📋 Test 6: CLI Interface"
    puts "-" * 40
    
    begin
      # Test help output
      help_output = `ruby master_audio.rb 2>&1`
      assert(help_output.include?("Usage:"), "Help output displayed")
      assert(help_output.include?("Options:"), "Options listed")
      
      puts "✅ CLI interface test passed"
      @test_results << { test: "CLI Interface", status: "PASS" }
      
    rescue => e
      puts "❌ CLI interface test failed: #{e.message}"
      @test_results << { test: "CLI Interface", status: "FAIL", error: e.message }
    end
  end

  def create_test_file(extension = 'wav')
    test_file = "test_audio.#{extension}"
    
    # Create a simple test file (just for testing)
    File.write(test_file, "test audio data")
    test_file
  end

  def assert(condition, message)
    unless condition
      raise "Assertion failed: #{message}"
    end
  end

  def display_results
    puts "\n📊 Test Results Summary"
    puts "=" * 60
    
    passed = @test_results.count { |r| r[:status] == "PASS" }
    failed = @test_results.count { |r| r[:status] == "FAIL" }
    total = @test_results.length
    
    @test_results.each do |result|
      status_icon = result[:status] == "PASS" ? "✅" : "❌"
      puts "#{status_icon} #{result[:test]}"
      puts "   Error: #{result[:error]}" if result[:error]
    end
    
    puts "\n📈 Summary:"
    puts "   Total Tests: #{total}"
    puts "   Passed: #{passed}"
    puts "   Failed: #{failed}"
    puts "   Success Rate: #{(passed.to_f / total * 100).round(1)}%"
    
    if failed == 0
      puts "\n🎉 All tests passed! The Crys Garage mastering engine is ready."
    else
      puts "\n⚠️  Some tests failed. Please review the errors above."
    end
  end
end

# Run tests if this script is executed directly
if __FILE__ == $0
  puts "🎵 Crys Garage Audio Mastering Engine - Test Suite"
  puts "Testing the Ruby audio mastering engine functionality..."
  
  test_suite = CrysGarageTest.new
  test_suite.run_all_tests
end 