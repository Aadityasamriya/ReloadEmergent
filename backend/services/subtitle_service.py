"""
Subtitle Extraction Service
Extracts subtitles and closed captions from videos
"""
import logging
import yt_dlp
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


def get_subtitles(url: str) -> Dict[str, Any]:
    """
    Extract available subtitles from video
    Returns list of available subtitle languages and formats
    """
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'listsubtitles': True,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Extracting subtitles from: {url}")
            info = ydl.extract_info(url, download=False)
            
            if info is None:
                raise ValueError("Could not extract video information")
            
            # Get manual subtitles
            subtitles = info.get('subtitles', {})
            # Get automatic captions
            automatic_captions = info.get('automatic_captions', {})
            
            result = {
                'available': bool(subtitles or automatic_captions),
                'manual_subtitles': list(subtitles.keys()) if subtitles else [],
                'automatic_captions': list(automatic_captions.keys()) if automatic_captions else [],
                'subtitle_data': [],
                'message': ''
            }
            
            # Process manual subtitles
            for lang, formats in subtitles.items():
                for fmt in formats:
                    result['subtitle_data'].append({
                        'language': lang,
                        'language_name': get_language_name(lang),
                        'type': 'manual',
                        'format': fmt.get('ext', 'srt'),
                        'url': fmt.get('url', '')
                    })
            
            # Process automatic captions
            for lang, formats in automatic_captions.items():
                for fmt in formats:
                    result['subtitle_data'].append({
                        'language': lang,
                        'language_name': get_language_name(lang),
                        'type': 'automatic',
                        'format': fmt.get('ext', 'srt'),
                        'url': fmt.get('url', '')
                    })
            
            if result['available']:
                result['message'] = f"Found {len(result['subtitle_data'])} subtitle options"
            else:
                result['message'] = "No subtitles available for this video"
            
            logger.info(f"Found {len(result['subtitle_data'])} subtitle options")
            return result
            
    except Exception as e:
        logger.error(f"Subtitle extraction failed: {str(e)}")
        return {
            'available': False,
            'manual_subtitles': [],
            'automatic_captions': [],
            'subtitle_data': [],
            'message': f"Could not extract subtitles: {str(e)}"
        }


def get_language_name(lang_code: str) -> str:
    """Convert language code to readable name"""
    language_names = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'pl': 'Polish',
        'tr': 'Turkish'
    }
    return language_names.get(lang_code, lang_code.upper())
