import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Download, Loader2, AlertCircle, CheckCircle2, 
  Video, Music, FileText, Clock, Eye, Play,
  ChevronDown, X, Info
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const MinimalistHomePage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [subtitles, setSubtitles] = useState(null);
  const [selectedTab, setSelectedTab] = useState('video');

  useEffect(() => {
    const savedHistory = localStorage.getItem('downloadHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  const handleExtract = async () => {
    setError('');
    setExtractedData(null);
    setSubtitles(null);
    
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      setError('Invalid URL format');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/extract`, {
        url: url.trim()
      }, {
        timeout: 60000
      });

      if (response.data.success) {
        const data = response.data.data;
        setExtractedData(data);

        // Add to history
        const newHistoryItem = {
          id: Date.now().toString(),
          url: url.trim(),
          title: data.title,
          platform: data.platform,
          timestamp: Date.now(),
          thumbnail: data.thumbnail || ''
        };
        
        const updatedHistory = [newHistoryItem, ...history].slice(0, 20);
        setHistory(updatedHistory);
        localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
        
        // Fetch subtitles
        fetchSubtitles(url.trim());
      }
    } catch (err) {
      console.error('Extraction error:', err);
      
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError('Failed to extract video. Please check the URL.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtitles = async (videoUrl) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/subtitles`, {
        url: videoUrl
      });
      
      if (response.data.success && response.data.data.available) {
        setSubtitles(response.data.data);
      }
    } catch (err) {
      console.log('Subtitles not available');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('downloadHistory');
    setShowHistory(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const videoFormats = extractedData?.formats?.filter(f => f.type === 'video' || f.has_video) || [];
  const audioFormats = extractedData?.formats?.filter(f => f.type === 'audio' || (!f.has_video && f.has_audio)) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ReloadTheGraphics</h1>
                <p className="text-sm text-gray-500">Video Downloader</p>
              </div>
            </div>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Clock className="w-4 h-4 mr-2" />
                History
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Download Any Video
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Paste a URL from YouTube, Instagram, TikTok, or 1000+ other platforms
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <Card className="mb-8 border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Downloads</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setUrl(item.url);
                      setShowHistory(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="w-16 h-12 object-cover rounded border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.platform} • {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Section */}
        <div className="mb-12">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="Paste video URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
              className="flex-1 h-14 text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              disabled={loading}
            />
            <Button
              onClick={handleExtract}
              disabled={loading || !url.trim()}
              className="h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Extracting
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
          <p className="mt-3 text-sm text-gray-500 text-center">
            Supports YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo, and 1000+ more
          </p>
        </div>

        {/* Results Section */}
        {extractedData && (
          <div className="space-y-6">
            {/* Video Info Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {extractedData.thumbnail && (
                    <img
                      src={extractedData.thumbnail}
                      alt={extractedData.title}
                      className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {extractedData.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        <Play className="w-3 h-3 mr-1" />
                        {extractedData.platform}
                      </Badge>
                      {extractedData.duration > 0 && (
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(extractedData.duration)}
                        </Badge>
                      )}
                      {extractedData.view_count > 0 && (
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatNumber(extractedData.view_count)} views
                        </Badge>
                      )}
                    </div>
                    {extractedData.uploader && (
                      <p className="mt-3 text-sm text-gray-600">
                        By {extractedData.uploader}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setSelectedTab('video')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    selectedTab === 'video'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Video ({videoFormats.length})
                </button>
                <button
                  onClick={() => setSelectedTab('audio')}
                  className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                    selectedTab === 'audio'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Music className="w-4 h-4 inline mr-2" />
                  Audio ({audioFormats.length})
                </button>
                {subtitles?.available && (
                  <button
                    onClick={() => setSelectedTab('subtitles')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      selectedTab === 'subtitles'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Subtitles ({subtitles.subtitle_data.length})
                  </button>
                )}
              </div>
            </div>

            {/* Video Formats */}
            {selectedTab === 'video' && (
              <div className="space-y-3">
                {videoFormats.map((format, idx) => (
                  <Card key={idx} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{format.quality}</div>
                            <div className="text-sm text-gray-500">
                              {format.ext?.toUpperCase()} • {format.filesize_readable}
                              {format.has_audio && (
                                <span className="ml-2 text-green-600">+ Audio</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(format.url, '_blank')}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Audio Formats */}
            {selectedTab === 'audio' && (
              <div className="space-y-3">
                {audioFormats.length > 0 ? (
                  audioFormats.map((format, idx) => (
                    <Card key={idx} className="border border-gray-200 hover:border-gray-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{format.quality}</div>
                              <div className="text-sm text-gray-500">
                                {format.ext?.toUpperCase()} • {format.filesize_readable}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(format.url, '_blank')}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No audio-only formats available</p>
                  </div>
                )}
              </div>
            )}

            {/* Subtitles */}
            {selectedTab === 'subtitles' && subtitles?.available && (
              <div className="space-y-3">
                {subtitles.subtitle_data.map((sub, idx) => (
                  <Card key={idx} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{sub.language_name}</div>
                            <div className="text-sm text-gray-500">
                              {sub.type === 'automatic' ? 'Auto-generated' : 'Manual'} • {sub.format.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(sub.url, '_blank')}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!extractedData && !loading && (
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How to use</h3>
              <p className="text-gray-600 mb-4">
                Copy a video URL from any supported platform and paste it above to get download links
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                <div>
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">1000+ Sites</div>
                </div>
                <div>
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">Multiple Qualities</div>
                </div>
                <div>
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">100% Free</div>
                </div>
                <div>
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">No Registration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              <strong className="text-gray-900">ReloadTheGraphics</strong> - Free Video Downloader
            </p>
            <p>
              Download videos from YouTube, Instagram, TikTok, Facebook, and 1000+ platforms
            </p>
            <p className="mt-4 text-xs">
              Respect copyright laws and creators' rights. For personal use only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalistHomePage;
