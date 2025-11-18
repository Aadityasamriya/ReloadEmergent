"""
yt-dlp service for extracting video information and download links
Supports 1000+ platforms including YouTube, Instagram, TikTok, Twitter, etc.
"""
import yt_dlp
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


def format_file_size(bytes_size: int) -> str:
    """Convert bytes to human-readable format"""
    if bytes_size is None:
        return "Unknown"
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} TB"


def get_video_info(url: str) -> Dict[str, Any]:
    """
    Extract video information using yt-dlp
    Returns comprehensive metadata and available formats
    """
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'format': 'best',
            'socket_timeout': 30,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Extracting info from: {url}")
            info = ydl.extract_info(url, download=False)
            
            if info is None:
                raise ValueError("Could not extract video information")
            
            # Extract basic metadata
            result = {
                'title': info.get('title', 'Unknown Title'),
                'description': info.get('description', ''),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'uploader': info.get('uploader', 'Unknown'),
                'view_count': info.get('view_count', 0),
                'like_count': info.get('like_count', 0),
                'upload_date': info.get('upload_date', ''),
                'platform': info.get('extractor_key', 'Unknown'),
                'webpage_url': info.get('webpage_url', url),
                'formats': []
            }
            
            # Process available formats
            formats = info.get('formats', [])
            processed_formats = process_formats(formats, info)
            result['formats'] = processed_formats
            
            logger.info(f"Successfully extracted {len(processed_formats)} formats")
            return result
            
    except Exception as e:
        logger.error(f"yt-dlp extraction failed: {str(e)}")
        raise ValueError(f"Failed to extract video info: {str(e)}")


def process_formats(formats: List[Dict], info: Dict) -> List[Dict[str, Any]]:
    """
    Process and organize available formats by quality
    Returns sorted list of download options with metadata
    """
    processed = []
    seen_qualities = set()
    
    # Sort formats by quality (height and filesize)
    sorted_formats = sorted(
        formats,
        key=lambda x: (
            x.get('height', 0) or 0,
            x.get('filesize', 0) or x.get('filesize_approx', 0) or 0
        ),
        reverse=True
    )
    
    for fmt in sorted_formats:
        # Skip formats without URL
        if not fmt.get('url'):
            continue
            
        height = fmt.get('height', 0)
        ext = fmt.get('ext', 'mp4')
        vcodec = fmt.get('vcodec', 'none')
        acodec = fmt.get('acodec', 'none')
        filesize = fmt.get('filesize') or fmt.get('filesize_approx', 0)
        
        # Determine format type
        has_video = vcodec and vcodec != 'none'
        has_audio = acodec and acodec != 'none'
        
        # Create quality label
        if has_video and has_audio:
            # Combined video+audio format
            if height:
                quality = f"{height}p"
            else:
                quality = "Best Quality"
                
            if quality not in seen_qualities or ext == 'mp4':
                format_data = {
                    'format_id': fmt.get('format_id'),
                    'quality': quality,
                    'ext': ext,
                    'filesize': filesize,
                    'filesize_readable': format_file_size(filesize),
                    'url': fmt.get('url'),
                    'has_video': True,
                    'has_audio': True,
                    'type': 'video',
                    'resolution': f"{fmt.get('width', 0)}x{height}" if height else "Unknown",
                    'fps': fmt.get('fps', 0),
                    'vcodec': vcodec,
                    'acodec': acodec,
                }
                processed.append(format_data)
                seen_qualities.add(quality)
                
        elif has_video and not has_audio:
            # Video-only format
            if height and height >= 720:  # Only include high quality video-only
                quality = f"{height}p (Video Only)"
                format_data = {
                    'format_id': fmt.get('format_id'),
                    'quality': quality,
                    'ext': ext,
                    'filesize': filesize,
                    'filesize_readable': format_file_size(filesize),
                    'url': fmt.get('url'),
                    'has_video': True,
                    'has_audio': False,
                    'type': 'video-only',
                    'resolution': f"{fmt.get('width', 0)}x{height}",
                    'fps': fmt.get('fps', 0),
                    'vcodec': vcodec,
                }
                processed.append(format_data)
                
        elif has_audio and not has_video:
            # Audio-only format
            abr = fmt.get('abr', 0)
            quality = f"Audio Only ({int(abr)}kbps)" if abr else "Audio Only"
            
            if 'Audio Only' not in seen_qualities:
                format_data = {
                    'format_id': fmt.get('format_id'),
                    'quality': quality,
                    'ext': ext if ext in ['mp3', 'm4a', 'opus', 'wav'] else 'mp3',
                    'filesize': filesize,
                    'filesize_readable': format_file_size(filesize),
                    'url': fmt.get('url'),
                    'has_video': False,
                    'has_audio': True,
                    'type': 'audio',
                    'abr': abr,
                    'acodec': acodec,
                }
                processed.append(format_data)
                seen_qualities.add('Audio Only')
    
    # If no formats found, try to get best format
    if not processed and info.get('url'):
        processed.append({
            'format_id': 'best',
            'quality': 'Best Available',
            'ext': info.get('ext', 'mp4'),
            'filesize': info.get('filesize', 0),
            'filesize_readable': format_file_size(info.get('filesize', 0)),
            'url': info.get('url'),
            'has_video': True,
            'has_audio': True,
            'type': 'video',
        })
    
    return processed


def get_direct_download_url(url: str, format_id: str = 'best') -> Dict[str, Any]:
    """
    Get direct download URL for a specific format
    """
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': format_id,
            'socket_timeout': 30,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                raise ValueError("Could not get download URL")
            
            return {
                'url': info.get('url'),
                'title': info.get('title'),
                'ext': info.get('ext', 'mp4'),
                'filesize': info.get('filesize', 0),
            }
            
    except Exception as e:
        logger.error(f"Failed to get download URL: {str(e)}")
        raise ValueError(f"Failed to get download URL: {str(e)}")
