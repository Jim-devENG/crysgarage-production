#!/usr/bin/env python3
"""
Simple ML Service for Crys Garage
Standalone Python script that works without complex dependencies
"""

import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLServiceHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/health':
            self.send_health_response()
        elif self.path == '/genres':
            self.send_genres_response()
        elif self.path == '/tiers':
            self.send_tiers_response()
        else:
            self.send_error_response('Endpoint not found', 404)
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/analyze':
            self.handle_analyze()
        else:
            self.send_error_response('Endpoint not found', 404)
    
    def send_health_response(self):
        """Send health check response"""
        response = {
            "status": "healthy",
            "service": "crys-garage-ml",
            "version": "1.0.0",
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.send_json_response(response)
    
    def send_genres_response(self):
        """Send supported genres"""
        response = {
            "genres": [
                "hip_hop",
                "afrobeats", 
                "gospel",
                "highlife",
                "r_b",
                "general"
            ]
        }
        self.send_json_response(response)
    
    def send_tiers_response(self):
        """Send supported tiers"""
        response = {
            "tiers": [
                "free",
                "pro", 
                "advanced"
            ]
        }
        self.send_json_response(response)
    
    def handle_analyze(self):
        """Handle audio analysis request"""
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Parse form data (simplified)
            data = post_data.decode('utf-8')
            
            # Extract tier and genre (simplified parsing)
            tier = 'free'
            genre = 'hip_hop'
            
            if 'tier=' in data:
                tier = data.split('tier=')[1].split('&')[0]
            if 'genre=' in data:
                genre = data.split('genre=')[1].split('&')[0]
            
            logger.info(f"Analyzing audio - tier: {tier}, genre: {genre}")
            
            # Generate recommendations
            recommendations = self.generate_recommendations(tier, genre)
            
            response = {
                "status": "success",
                "filename": "audio.wav",
                "recommendations": recommendations,
                "tier": tier,
                "genre": genre,
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            self.send_json_response(response)
            
        except Exception as e:
            logger.error(f"Error analyzing audio: {str(e)}")
            self.send_error_response(f"Analysis failed: {str(e)}", 500)
    
    def generate_recommendations(self, tier, genre):
        """Generate ML recommendations based on tier and genre"""
        # Base recommendations
        recommendations = {
            "eq": {"low": 1.0, "mid": 1.0, "high": 1.0},
            "compression": {"ratio": 2.0, "threshold": -12.0, "attack": 5, "release": 50},
            "limiter": {"threshold": -0.3, "release": 50},
            "genre": genre
        }
        
        # Genre-specific adjustments
        genre_adjustments = {
            "hip_hop": {
                "eq": {"low": 1.3, "mid": 0.9, "high": 1.1},
                "compression": {"ratio": 4.0, "threshold": -10.0}
            },
            "afrobeats": {
                "eq": {"low": 1.1, "mid": 1.2, "high": 1.3},
                "compression": {"ratio": 3.0, "threshold": -12.0}
            },
            "gospel": {
                "eq": {"low": 1.0, "mid": 1.1, "high": 1.0},
                "compression": {"ratio": 2.5, "threshold": -14.0}
            },
            "highlife": {
                "eq": {"low": 1.0, "mid": 1.0, "high": 1.2},
                "compression": {"ratio": 2.0, "threshold": -12.0}
            }
        }
        
        if genre in genre_adjustments:
            genre_rec = genre_adjustments[genre]
            recommendations["eq"].update(genre_rec["eq"])
            recommendations["compression"].update(genre_rec["compression"])
        
        # Tier-specific adjustments
        if tier == "pro":
            recommendations["compression"]["ratio"] *= 1.2
            recommendations["limiter"]["threshold"] = -0.5
        elif tier == "advanced":
            recommendations["compression"]["ratio"] *= 1.5
            recommendations["limiter"]["threshold"] = -0.8
            recommendations["stereo_width"] = 1.1
            recommendations["harmonic_exciter"] = {"amount": 0.1}
        
        return recommendations
    
    def send_json_response(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response_json = json.dumps(data, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def send_error_response(self, message, status_code):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {
            "status": "error",
            "message": message,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        response_json = json.dumps(error_response, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to use our logger"""
        logger.info(f"{self.address_string()} - {format % args}")

def run_server(port=5000):
    """Run the ML service server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MLServiceHandler)
    
    logger.info(f"Starting Crys Garage ML Service on port {port}")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  GET  /genres - Get supported genres")
    logger.info("  GET  /tiers - Get supported tiers")
    logger.info("  POST /analyze - Analyze audio")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down ML service...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()
