#!/usr/bin/env python3
"""
Detailed test to examine the exact response structure
"""

import requests
import json

BACKEND_URL = "https://video-grabber-79.preview.emergentagent.com/api"
TEST_URL = "https://www.dailymotion.com/video/x2jvvep"

def test_detailed_extraction():
    print("🔍 Running detailed extraction test...")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/extract",
            json={"url": TEST_URL},
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print("\n📋 DETAILED RESPONSE STRUCTURE:")
            print("="*50)
            print(f"Success: {data.get('success')}")
            print(f"Method: {data.get('method')}")
            
            video_data = data.get('data', {})
            print(f"\nVideo Title: {video_data.get('title')}")
            print(f"Platform: {video_data.get('platform')}")
            print(f"Duration: {video_data.get('duration')} seconds")
            print(f"Uploader: {video_data.get('uploader')}")
            
            formats = video_data.get('formats', [])
            print(f"\n📹 FORMATS FOUND: {len(formats)}")
            print("-" * 50)
            
            for i, fmt in enumerate(formats):
                print(f"\nFormat {i+1}:")
                print(f"  Quality: {fmt.get('quality')}")
                print(f"  Extension: {fmt.get('ext')}")
                print(f"  File Size: {fmt.get('filesize_readable')}")
                print(f"  Type: {fmt.get('type')}")
                print(f"  Has Video: {fmt.get('has_video')}")
                print(f"  Has Audio: {fmt.get('has_audio')}")
                print(f"  Format ID: {fmt.get('format_id')}")
                print(f"  Resolution: {fmt.get('resolution', 'N/A')}")
                print(f"  FPS: {fmt.get('fps', 'N/A')}")
                
            print("\n✅ Detailed test completed successfully!")
            return True
            
        else:
            print(f"❌ Request failed: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_detailed_extraction()