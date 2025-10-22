#!/usr/bin/env python3
import requests
import json

class CrysGarageAPI:
    def __init__(self, base_url="https://crysgarage.studio/api/v1"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def health_check(self):
        response = self.session.get(f"{self.base_url}/../health")
        return response.json()
    
    def get_info(self):
        response = self.session.get(f"{self.base_url}/info")
        return response.json()
    
    def get_tiers(self):
        response = self.session.get(f"{self.base_url}/tiers")
        return response.json()
    
    def master_audio(self, file_path, tier="professional", genre="default"):
        url = f"{self.base_url}/master"
        
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'tier': tier, 'genre': genre}
            response = self.session.post(url, files=files, data=data)
            return response.json()
    
    def download_file(self, file_id, output_path):
        url = f"{self.base_url}/download/{file_id}"
        response = self.session.get(url)
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        return output_path

if __name__ == "__main__":
    api = CrysGarageAPI()
    print("Health Check:", api.health_check())
    print("API Info:", api.get_info())
    print("Tiers:", api.get_tiers())
