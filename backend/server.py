from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional
import asyncio

# Import our services
from services.ytdlp_service import get_video_info, get_direct_download_url
from services.playwright_service import extract_with_playwright, scrape_with_beautifulsoup
from services.converter_service import convert_media, get_supported_formats
from services.subtitle_service import get_subtitles

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="ReloadTheGraphics Video Downloader API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Pydantic Models
class ExtractRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format_id: Optional[str] = "best"


class VideoInfo(BaseModel):
    title: str
    description: Optional[str] = ""
    duration: int = 0
    thumbnail: str = ""
    uploader: str = "Unknown"
    view_count: int = 0
    platform: str = "Unknown"
    webpage_url: str
    formats: List[Dict[str, Any]]


# API Endpoints
@api_router.get("/")
async def root():
    return {
        "message": "ReloadTheGraphics Video Downloader API",
        "version": "2.0",
        "status": "operational",
        "features": [
            "Multi-level extraction (yt-dlp, Playwright, BeautifulSoup)",
            "1000+ platforms supported",
            "Multiple quality options",
            "Direct download links",
            "No API keys required"
        ]
    }


@api_router.post("/extract")
async def extract_video(request: ExtractRequest):
    """
    Extract video information from URL using multi-level waterfall approach
    
    Level 1: yt-dlp (primary, supports 1000+ platforms)
    Level 2: Playwright (browser automation fallback)
    Level 3: BeautifulSoup (HTML parsing fallback)
    """
    url = request.url.strip()
    
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    logger.info(f"Starting extraction for URL: {url}")
    
    # Level 1: Try yt-dlp first (most comprehensive)
    try:
        logger.info("Level 1: Attempting yt-dlp extraction...")
        video_info = get_video_info(url)
        
        if video_info and video_info.get('formats'):
            logger.info(f"✅ yt-dlp SUCCESS: Found {len(video_info['formats'])} formats")
            return JSONResponse(content={
                "success": True,
                "method": "yt-dlp",
                "data": video_info
            })
    except Exception as e:
        logger.warning(f"Level 1 failed: {str(e)}")
    
    # Level 2: Try Playwright browser automation
    try:
        logger.info("Level 2: Attempting Playwright extraction...")
        proxy_key = os.environ.get('SCRAPINGBEE_API_KEY')
        playwright_result = await extract_with_playwright(url, proxy_key)
        
        if playwright_result and playwright_result.get('media_links'):
            logger.info(f"✅ Playwright SUCCESS: Found {len(playwright_result['media_links'])} media links")
            
            # Convert to standard format
            formats = []
            for idx, link in enumerate(playwright_result['media_links']):
                formats.append({
                    'format_id': f'browser_{idx}',
                    'quality': 'Best Available',
                    'ext': 'mp4',
                    'url': link['url'],
                    'has_video': True,
                    'has_audio': True,
                    'type': 'video',
                    'filesize': 0,
                    'filesize_readable': 'Unknown'
                })
            
            return JSONResponse(content={
                "success": True,
                "method": "playwright",
                "data": {
                    "title": playwright_result.get('title', 'Unknown'),
                    "platform": playwright_result.get('platform', 'Browser'),
                    "webpage_url": url,
                    "formats": formats,
                    "thumbnail": "",
                    "duration": 0
                }
            })
    except Exception as e:
        logger.warning(f"Level 2 failed: {str(e)}")
    
    # Level 3: Try BeautifulSoup HTML parsing
    try:
        logger.info("Level 3: Attempting BeautifulSoup extraction...")
        bs_result = await scrape_with_beautifulsoup(url)
        
        if bs_result and bs_result.get('media_links'):
            logger.info(f"✅ BeautifulSoup SUCCESS: Found {len(bs_result['media_links'])} media links")
            
            formats = []
            for idx, link in enumerate(bs_result['media_links']):
                formats.append({
                    'format_id': f'html_{idx}',
                    'quality': 'Available',
                    'ext': 'mp4',
                    'url': link['url'],
                    'has_video': True,
                    'has_audio': True,
                    'type': 'video',
                    'filesize': 0,
                    'filesize_readable': 'Unknown'
                })
            
            return JSONResponse(content={
                "success": True,
                "method": "beautifulsoup",
                "data": {
                    "title": bs_result.get('title', 'Unknown'),
                    "platform": bs_result.get('platform', 'HTML'),
                    "webpage_url": url,
                    "formats": formats,
                    "thumbnail": "",
                    "duration": 0
                }
            })
    except Exception as e:
        logger.warning(f"Level 3 failed: {str(e)}")
    
    # All methods failed
    logger.error(f"❌ All extraction methods failed for URL: {url}")
    raise HTTPException(
        status_code=400,
        detail="Could not extract video from this URL. The platform may not be supported or the URL is invalid."
    )


@api_router.post("/download")
async def get_download_link(request: DownloadRequest):
    """
    Get direct download link for a specific format
    """
    try:
        result = get_direct_download_url(request.url, request.format_id)
        return JSONResponse(content={
            "success": True,
            "data": result
        })
    except Exception as e:
        logger.error(f"Failed to get download link: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "video-downloader-api",
        "version": "2.0"
    }


@api_router.get("/formats")
async def get_formats():
    """Get list of supported conversion formats"""
    try:
        formats = get_supported_formats()
        return JSONResponse(content={
            "success": True,
            "data": formats
        })
    except Exception as e:
        logger.error(f"Failed to get formats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/convert")
async def convert_video(request: dict):
    """Convert video to specified format"""
    try:
        url = request.get('url')
        output_format = request.get('format', 'mp4')
        quality = request.get('quality', 'medium')
        
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        result = await convert_media(url, output_format, quality)
        return JSONResponse(content={
            "success": True,
            "data": result
        })
    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/subtitles")
async def extract_subtitles(request: ExtractRequest):
    """Extract subtitles from video"""
    try:
        url = request.url.strip()
        
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        logger.info(f"Extracting subtitles from: {url}")
        result = get_subtitles(url)
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
    except Exception as e:
        logger.error(f"Subtitle extraction failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("🚀 ReloadTheGraphics Video Downloader API initialized")