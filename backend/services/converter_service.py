"""
Video/Audio Conversion Service
Supports converting to multiple formats: mp3, mp4, webm, aac, ogg, m4a
"""
import logging
import os
import tempfile
import subprocess
from typing import Dict, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

SUPPORTED_FORMATS = {
    'mp3': {'ext': 'mp3', 'codec': 'libmp3lame', 'type': 'audio'},
    'mp4': {'ext': 'mp4', 'codec': 'libx264', 'type': 'video'},
    'webm': {'ext': 'webm', 'codec': 'libvpx', 'type': 'video'},
    'aac': {'ext': 'aac', 'codec': 'aac', 'type': 'audio'},
    'ogg': {'ext': 'ogg', 'codec': 'libvorbis', 'type': 'audio'},
    'm4a': {'ext': 'm4a', 'codec': 'aac', 'type': 'audio'},
    '3gp': {'ext': '3gp', 'codec': 'h263', 'type': 'video'}
}


async def convert_media(input_url: str, output_format: str, quality: str = 'medium') -> Dict[str, Any]:
    """
    Convert media to specified format
    Returns conversion info or raises exception
    """
    try:
        if output_format not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {output_format}. Supported: {', '.join(SUPPORTED_FORMATS.keys())}")
        
        format_info = SUPPORTED_FORMATS[output_format]
        
        # Quality settings
        quality_settings = {
            'high': {'video_bitrate': '1500k', 'audio_bitrate': '320k'},
            'medium': {'video_bitrate': '1000k', 'audio_bitrate': '192k'},
            'low': {'video_bitrate': '500k', 'audio_bitrate': '128k'}
        }
        
        settings = quality_settings.get(quality, quality_settings['medium'])
        
        # For web-based conversion, we'll return the format info
        # Actual conversion would happen client-side or with a streaming endpoint
        
        return {
            'success': True,
            'format': output_format,
            'format_type': format_info['type'],
            'codec': format_info['codec'],
            'quality': quality,
            'settings': settings,
            'message': f'Ready to convert to {output_format.upper()}'
        }
        
    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        raise ValueError(f"Conversion failed: {str(e)}")


def get_supported_formats() -> Dict[str, Any]:
    """Return list of supported conversion formats"""
    return {
        'formats': SUPPORTED_FORMATS,
        'audio_formats': [k for k, v in SUPPORTED_FORMATS.items() if v['type'] == 'audio'],
        'video_formats': [k for k, v in SUPPORTED_FORMATS.items() if v['type'] == 'video']
    }
