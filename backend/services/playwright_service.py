"""
Playwright service for browser-based extraction
Used as fallback when yt-dlp fails
"""
import asyncio
import logging
from typing import Dict, List, Any, Optional
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
import os

logger = logging.getLogger(__name__)


async def extract_with_playwright(url: str, proxy_api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract media links using Playwright browser automation
    """
    try:
        logger.info(f"Attempting Playwright extraction for: {url}")
        
        async with async_playwright() as p:
            # Launch browser with appropriate options
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            
            page = await context.new_page()
            
            # Navigate to the URL
            try:
                await page.goto(url, timeout=30000, wait_until='networkidle')
            except PlaywrightTimeout:
                # Try with domcontentloaded if networkidle times out
                await page.goto(url, timeout=30000, wait_until='domcontentloaded')
            
            # Wait for potential video elements to load
            await asyncio.sleep(2)
            
            # Get page content
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract media links
            media_links = []
            
            # Look for video elements
            for video in soup.find_all('video'):
                src = video.get('src')
                if src:
                    media_links.append({
                        'type': 'video',
                        'url': src,
                        'source': 'video_tag'
                    })
                
                # Check source tags
                for source in video.find_all('source'):
                    src = source.get('src')
                    if src:
                        media_links.append({
                            'type': 'video',
                            'url': src,
                            'source': 'source_tag'
                        })
            
            # Look for meta tags with video info
            for meta in soup.find_all('meta'):
                property_val = meta.get('property', '')
                if 'video' in property_val.lower():
                    content_val = meta.get('content')
                    if content_val:
                        media_links.append({
                            'type': 'video',
                            'url': content_val,
                            'source': 'meta_tag'
                        })
            
            await browser.close()
            
            if not media_links:
                raise ValueError("No media links found")
            
            # Get page title
            title = soup.find('title')
            title_text = title.get_text() if title else 'Unknown Title'
            
            result = {
                'title': title_text,
                'media_links': media_links,
                'platform': 'Browser Extraction',
            }
            
            logger.info(f"Playwright found {len(media_links)} media links")
            return result
            
    except Exception as e:
        logger.error(f"Playwright extraction failed: {str(e)}")
        raise ValueError(f"Browser extraction failed: {str(e)}")


async def scrape_with_beautifulsoup(url: str) -> Dict[str, Any]:
    """
    Basic HTML scraping with BeautifulSoup
    Last fallback method
    """
    try:
        import aiohttp
        
        logger.info(f"Attempting BeautifulSoup extraction for: {url}")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=30) as response:
                html = await response.text()
                
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for video and image links
        media_links = []
        
        for video in soup.find_all('video'):
            src = video.get('src')
            if src:
                media_links.append({'type': 'video', 'url': src})
        
        for img in soup.find_all('img'):
            src = img.get('src')
            if src and any(ext in src for ext in ['.mp4', '.webm', '.mov']):
                media_links.append({'type': 'video', 'url': src})
        
        if not media_links:
            raise ValueError("No media found in HTML")
        
        title = soup.find('title')
        title_text = title.get_text() if title else 'Unknown Title'
        
        return {
            'title': title_text,
            'media_links': media_links,
            'platform': 'HTML Scraping',
        }
        
    except Exception as e:
        logger.error(f"BeautifulSoup extraction failed: {str(e)}")
        raise ValueError(f"HTML scraping failed: {str(e)}")
