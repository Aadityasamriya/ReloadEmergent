#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for ReloadTheGraphics Video Downloader
Tests all endpoints with real YouTube URL extraction
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://video-grabber-79.preview.emergentagent.com/api"

# Test URLs for different platforms
TEST_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
TEST_VIMEO_URL = "https://vimeo.com/148751763"  # Short test video
TEST_DAILYMOTION_URL = "https://www.dailymotion.com/video/x2jvvep"  # Alternative platform

class BackendTester:
    def __init__(self):
        self.results = {
            "health_check": {"status": "pending", "details": ""},
            "root_endpoint": {"status": "pending", "details": ""},
            "extract_endpoint": {"status": "pending", "details": ""},
            "format_validation": {"status": "pending", "details": ""},
            "download_endpoint": {"status": "pending", "details": ""}
        }
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ReloadTheGraphics-Tester/1.0'
        })

    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def test_health_check(self) -> bool:
        """Test GET /api/health endpoint"""
        self.log("Testing health check endpoint...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ["status", "service", "version"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.results["health_check"] = {
                        "status": "failed",
                        "details": f"Missing fields: {missing_fields}"
                    }
                    return False
                
                if data.get("status") == "healthy":
                    self.results["health_check"] = {
                        "status": "passed",
                        "details": f"Service healthy, version: {data.get('version')}"
                    }
                    self.log("✅ Health check passed")
                    return True
                else:
                    self.results["health_check"] = {
                        "status": "failed",
                        "details": f"Service not healthy: {data.get('status')}"
                    }
                    return False
            else:
                self.results["health_check"] = {
                    "status": "failed",
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                return False
                
        except Exception as e:
            self.results["health_check"] = {
                "status": "failed",
                "details": f"Request failed: {str(e)}"
            }
            self.log(f"❌ Health check failed: {str(e)}", "ERROR")
            return False

    def test_root_endpoint(self) -> bool:
        """Test GET /api/ endpoint"""
        self.log("Testing root endpoint...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ["message", "version", "status", "features"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.results["root_endpoint"] = {
                        "status": "failed",
                        "details": f"Missing fields: {missing_fields}"
                    }
                    return False
                
                # Validate features list
                features = data.get("features", [])
                if not isinstance(features, list) or len(features) == 0:
                    self.results["root_endpoint"] = {
                        "status": "failed",
                        "details": "Features list is empty or invalid"
                    }
                    return False
                
                self.results["root_endpoint"] = {
                    "status": "passed",
                    "details": f"API info returned with {len(features)} features"
                }
                self.log(f"✅ Root endpoint passed - {len(features)} features listed")
                return True
            else:
                self.results["root_endpoint"] = {
                    "status": "failed",
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                return False
                
        except Exception as e:
            self.results["root_endpoint"] = {
                "status": "failed",
                "details": f"Request failed: {str(e)}"
            }
            self.log(f"❌ Root endpoint failed: {str(e)}", "ERROR")
            return False

    def test_extract_endpoint(self) -> Dict[str, Any]:
        """Test POST /api/extract endpoint with multiple URLs"""
        test_urls = [
            ("Vimeo", TEST_VIMEO_URL),
            ("Dailymotion", TEST_DAILYMOTION_URL),
            ("YouTube", TEST_YOUTUBE_URL)
        ]
        
        for platform, url in test_urls:
            self.log(f"Testing extract endpoint with {platform} URL: {url}")
            self.log("⏳ This may take 10-30 seconds for yt-dlp extraction...")
            
            try:
                payload = {"url": url}
                response = self.session.post(
                    f"{BACKEND_URL}/extract", 
                    json=payload, 
                    timeout=60  # Extended timeout for yt-dlp
                )
            
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate response structure
                    if not data.get("success"):
                        self.log(f"❌ {platform} extraction failed: success=false")
                        continue
                    
                    # Check method used
                    method = data.get("method")
                    if method not in ["yt-dlp", "playwright", "beautifulsoup"]:
                        self.log(f"❌ {platform} extraction failed: invalid method {method}")
                        continue
                    
                    # Validate data structure
                    video_data = data.get("data", {})
                    required_fields = ["title", "platform", "formats"]
                    missing_fields = [field for field in required_fields if field not in video_data]
                    
                    if missing_fields:
                        self.log(f"❌ {platform} extraction failed: missing fields {missing_fields}")
                        continue
                    
                    formats = video_data.get("formats", [])
                    if not isinstance(formats, list) or len(formats) == 0:
                        self.log(f"❌ {platform} extraction failed: no formats found")
                        continue
                    
                    # Success!
                    self.results["extract_endpoint"] = {
                        "status": "passed",
                        "details": f"Extraction successful with {platform} using {method}, found {len(formats)} formats"
                    }
                    self.log(f"✅ Extract endpoint passed - Platform: {platform}, Method: {method}, Formats: {len(formats)}")
                    return data
                    
                else:
                    self.log(f"❌ {platform} extraction failed: HTTP {response.status_code}")
                    continue
                    
            except Exception as e:
                self.log(f"❌ {platform} extraction failed: {str(e)}", "ERROR")
                continue
        
        # All URLs failed
        self.results["extract_endpoint"] = {
            "status": "failed",
            "details": "All test URLs failed extraction"
        }
        return None

    def test_format_validation(self, extract_data: Dict[str, Any]) -> bool:
        """Validate format structure and content"""
        if not extract_data:
            self.results["format_validation"] = {
                "status": "failed",
                "details": "No extract data to validate"
            }
            return False
        
        self.log("Validating format structure...")
        
        try:
            video_data = extract_data.get("data", {})
            formats = video_data.get("formats", [])
            
            validation_results = {
                "total_formats": len(formats),
                "quality_options": [],
                "file_sizes": [],
                "format_types": [],
                "missing_fields": []
            }
            
            # Required fields for each format
            required_format_fields = ["quality", "ext", "url", "type", "has_video", "has_audio"]
            
            for i, fmt in enumerate(formats):
                # Check required fields
                missing = [field for field in required_format_fields if field not in fmt]
                if missing:
                    validation_results["missing_fields"].extend([f"Format {i}: {field}" for field in missing])
                
                # Collect quality options
                quality = fmt.get("quality", "Unknown")
                if quality not in validation_results["quality_options"]:
                    validation_results["quality_options"].append(quality)
                
                # Check file size readability
                filesize_readable = fmt.get("filesize_readable", "")
                if filesize_readable and filesize_readable != "Unknown":
                    validation_results["file_sizes"].append(filesize_readable)
                
                # Collect format types
                fmt_type = fmt.get("type", "unknown")
                if fmt_type not in validation_results["format_types"]:
                    validation_results["format_types"].append(fmt_type)
            
            # Validation checks
            issues = []
            
            if validation_results["missing_fields"]:
                issues.append(f"Missing fields: {validation_results['missing_fields'][:5]}")  # Show first 5
            
            if len(validation_results["quality_options"]) < 2:
                issues.append("Less than 2 quality options available")
            
            if len(validation_results["file_sizes"]) == 0:
                issues.append("No readable file sizes found")
            
            if "video" not in validation_results["format_types"]:
                issues.append("No video formats found")
            
            if issues:
                self.results["format_validation"] = {
                    "status": "failed",
                    "details": f"Validation issues: {'; '.join(issues)}"
                }
                return False
            else:
                self.results["format_validation"] = {
                    "status": "passed",
                    "details": f"All formats valid - {len(validation_results['quality_options'])} qualities, {len(validation_results['format_types'])} types"
                }
                self.log(f"✅ Format validation passed - Qualities: {validation_results['quality_options']}")
                return True
                
        except Exception as e:
            self.results["format_validation"] = {
                "status": "failed",
                "details": f"Validation error: {str(e)}"
            }
            self.log(f"❌ Format validation failed: {str(e)}", "ERROR")
            return False

    def test_download_endpoint(self, extract_data: Dict[str, Any]) -> bool:
        """Test POST /api/download endpoint"""
        if not extract_data:
            self.results["download_endpoint"] = {
                "status": "skipped",
                "details": "No extract data available for download test"
            }
            return False
        
        self.log("Testing download endpoint...")
        
        try:
            # Use the first available format
            formats = extract_data.get("data", {}).get("formats", [])
            if not formats:
                self.results["download_endpoint"] = {
                    "status": "failed",
                    "details": "No formats available for download test"
                }
                return False
            
            format_id = formats[0].get("format_id", "best")
            payload = {
                "url": TEST_YOUTUBE_URL,
                "format_id": format_id
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/download",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and data.get("data", {}).get("url"):
                    self.results["download_endpoint"] = {
                        "status": "passed",
                        "details": f"Download link generated for format: {format_id}"
                    }
                    self.log("✅ Download endpoint passed")
                    return True
                else:
                    self.results["download_endpoint"] = {
                        "status": "failed",
                        "details": "No download URL in response"
                    }
                    return False
            else:
                self.results["download_endpoint"] = {
                    "status": "failed",
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                return False
                
        except Exception as e:
            self.results["download_endpoint"] = {
                "status": "failed",
                "details": f"Request failed: {str(e)}"
            }
            self.log(f"❌ Download endpoint failed: {str(e)}", "ERROR")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting comprehensive backend API tests...")
        self.log(f"Backend URL: {BACKEND_URL}")
        
        # Test 1: Health Check
        health_ok = self.test_health_check()
        
        # Test 2: Root Endpoint
        root_ok = self.test_root_endpoint()
        
        # Test 3: Extract Endpoint (PRIMARY TEST)
        extract_data = self.test_extract_endpoint()
        extract_ok = extract_data is not None
        
        # Test 4: Format Validation
        format_ok = self.test_format_validation(extract_data) if extract_ok else False
        
        # Test 5: Download Endpoint
        download_ok = self.test_download_endpoint(extract_data) if extract_ok else False
        
        # Summary
        self.print_summary()
        
        return {
            "health_check": health_ok,
            "root_endpoint": root_ok,
            "extract_endpoint": extract_ok,
            "format_validation": format_ok,
            "download_endpoint": download_ok
        }

    def print_summary(self):
        """Print test results summary"""
        self.log("\n" + "="*60)
        self.log("🧪 BACKEND API TEST RESULTS SUMMARY")
        self.log("="*60)
        
        for test_name, result in self.results.items():
            status = result["status"]
            details = result["details"]
            
            if status == "passed":
                icon = "✅"
            elif status == "failed":
                icon = "❌"
            else:
                icon = "⏭️"
            
            self.log(f"{icon} {test_name.replace('_', ' ').title()}: {status.upper()}")
            if details:
                self.log(f"   Details: {details}")
        
        # Overall status
        passed = sum(1 for r in self.results.values() if r["status"] == "passed")
        total = len([r for r in self.results.values() if r["status"] != "skipped"])
        
        self.log(f"\n📊 Overall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        else:
            self.log("⚠️  Some tests failed. Check details above.")


if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if all(results.values()):
        sys.exit(0)
    else:
        sys.exit(1)