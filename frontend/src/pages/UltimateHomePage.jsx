import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Download, Link2, History, Loader2, Video, CheckCircle, AlertCircle, 
  Sparkles, TrendingUp, Clock, Eye, Music, Scissors, Merge, Subtitles,
  Smartphone, Globe, Shield, Zap, PlayCircle, FileVideo, FileAudio,
  Youtube, Instagram, Twitter, Facebook
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const UltimateHomePage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('download');
  const [extractionMethod, setExtractionMethod] = useState('');
  const [subtitles, setSubtitles] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [stats, setStats] = useState({ downloads: 1247, platforms: 1000, users: 52341 });

  useEffect(() => {
    const savedHistory = localStorage.getItem('downloadHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
    
    // Animate stats on load
    animateStats();
  }, []);

  const animateStats = () => {
    // Simple animation effect for stats
    const interval = setInterval(() => {
      setStats(prev => ({
        downloads: prev.downloads + Math.floor(Math.random() * 3),
        platforms: prev.platforms,
        users: prev.users + Math.floor(Math.random() * 5)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  };

  const handleExtract = async () => {
    setError('');
    setSuccess('');
    setExtractedData(null);
    setSubtitles(null);
    
    if (!url.trim()) {
      setError('Please enter a valid video URL');
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL');
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
        setExtractionMethod(response.data.method);
        setSuccess(`Successfully extracted video using ${response.data.method}!`);

        // Add to history
        const newHistoryItem = {
          id: Date.now().toString(),
          url: url.trim(),
          title: data.title,
          platform: data.platform,
          timestamp: Date.now(),
          thumbnail: data.thumbnail || '',
          method: response.data.method
        };
        
        const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
        setHistory(updatedHistory);
        localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
        
        // Also fetch subtitles if available
        fetchSubtitles(url.trim());
      }
    } catch (err) {
      console.error('Extraction error:', err);
      
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to extract video. Please check the URL and try again.');
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
    setSuccess('History cleared successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
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

  const getPlatformIcon = (platform) => {
    const platformName = platform?.toLowerCase() || '';
    if (platformName.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (platformName.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (platformName.includes('twitter') || platformName.includes('x')) return <Twitter className="w-4 h-4" />;
    if (platformName.includes('facebook')) return <Facebook className="w-4 h-4" />;
    return <Video className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Premium Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-3 rounded-2xl">
                  <Download className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  ReloadTheGraphics
                </h1>
                <p className="text-sm text-purple-200 font-medium flex items-center gap-2 mt-1">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  Ultimate Video Downloader & Converter
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{formatNumber(stats.downloads)}</div>
                <div className="text-xs text-purple-300">Downloads Today</div>
              </div>
              <Badge variant="secondary" className="px-4 py-2 bg-green-500/20 text-green-300 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12 max-w-7xl">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-300">Error</div>
              <div className="text-sm text-red-200">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-green-300">Success</div>
              <div className="text-sm text-green-200">{success}</div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
            Download Videos
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              From Anywhere
            </span>
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Extract and download videos from 1000+ platforms in seconds. Free, fast, and no registration required.
          </p>
        </div>

        {/* Main Download Card */}
        <Card className="mb-12 border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Link2 className="w-6 h-6 text-purple-400" />
              Paste Video URL
            </CardTitle>
            <CardDescription className="text-purple-200">
              Supports YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo, and 1000+ more platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300 h-14 text-lg backdrop-blur-sm"
                disabled={loading}
              />
              <Button
                onClick={handleExtract}
                disabled={loading || !url.trim()}
                className="h-14 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </div>

            {/* Platform Badges */}
            <div className="flex flex-wrap gap-2">
              {['YouTube', 'Instagram', 'TikTok', 'Twitter', 'Facebook', 'Vimeo', 'Dailymotion', '+1000 more'].map((platform) => (
                <Badge key={platform} variant="outline" className="bg-white/5 border-white/20 text-purple-200">
                  {platform}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {extractedData && (
          <Card className="mb-12 border-white/10 bg-black/30 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-white mb-2">{extractedData.title}</CardTitle>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-200">
                      {getPlatformIcon(extractedData.platform)}
                      <span className="ml-1">{extractedData.platform}</span>
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50 text-blue-200">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(extractedData.duration)}
                    </Badge>
                    {extractedData.view_count > 0 && (
                      <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-200">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatNumber(extractedData.view_count)} views
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-pink-500/20 border-pink-500/50 text-pink-200">
                      <Zap className="w-3 h-3 mr-1" />
                      {extractionMethod}
                    </Badge>
                  </div>
                </div>
                {extractedData.thumbnail && (
                  <img 
                    src={extractedData.thumbnail} 
                    alt="Thumbnail" 
                    className="w-32 h-20 object-cover rounded-lg border-2 border-white/20"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="video" className="w-full">
                <TabsList className="bg-white/10 border border-white/20 mb-4">
                  <TabsTrigger value="video" className="data-[state=active]:bg-purple-600">
                    <FileVideo className="w-4 h-4 mr-2" />
                    Video Formats
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="data-[state=active]:bg-purple-600">
                    <FileAudio className="w-4 h-4 mr-2" />
                    Audio Only
                  </TabsTrigger>
                  {subtitles?.available && (
                    <TabsTrigger value="subtitles" className="data-[state=active]:bg-purple-600">
                      <Subtitles className="w-4 h-4 mr-2" />
                      Subtitles ({subtitles.subtitle_data.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="video" className="space-y-3">
                  {extractedData.formats
                    ?.filter(f => f.type === 'video' || f.has_video)
                    .map((format, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{format.quality}</div>
                              <div className="text-sm text-purple-300">
                                {format.ext?.toUpperCase()} • {format.filesize_readable}
                                {format.has_audio && <Badge className="ml-2 bg-green-500/20 text-green-300 text-xs">+ Audio</Badge>}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(format.url, '_blank')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="audio" className="space-y-3">
                  {extractedData.formats
                    ?.filter(f => f.type === 'audio' || (!f.has_video && f.has_audio))
                    .map((format, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{format.quality}</div>
                              <div className="text-sm text-purple-300">
                                {format.ext?.toUpperCase()} • {format.filesize_readable}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(format.url, '_blank')}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                </TabsContent>

                {subtitles?.available && (
                  <TabsContent value="subtitles" className="space-y-3">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                      <p className="text-blue-200 text-sm">{subtitles.message}</p>
                    </div>
                    {subtitles.subtitle_data.map((sub, idx) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <Subtitles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{sub.language_name}</div>
                              <div className="text-sm text-purple-300">
                                {sub.type === 'automatic' ? 'Auto-generated' : 'Manual'} • {sub.format.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(sub.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Download className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-white">Multi-Platform Support</CardTitle>
              <CardDescription className="text-purple-200">
                Download from 1000+ platforms including YouTube, Instagram, TikTok, Twitter, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Music className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-white">Audio Extraction</CardTitle>
              <CardDescription className="text-purple-200">
                Extract audio from any video in MP3, M4A, AAC, and other popular formats
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4">
                <Subtitles className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-white">Subtitle Download</CardTitle>
              <CardDescription className="text-purple-200">
                Download subtitles and closed captions in multiple languages when available
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-white">Lightning Fast</CardTitle>
              <CardDescription className="text-purple-200">
                Advanced extraction algorithms ensure quick processing and download speeds
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-white">100% Free</CardTitle>
              <CardDescription className="text-purple-200">
                No registration, no fees, no limits. Completely free video downloader forever
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-white">Mobile Friendly</CardTitle>
              <CardDescription className="text-purple-200">
                Works perfectly on all devices - desktop, tablet, and mobile phones
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <Card className="border-white/10 bg-black/30 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    Download History
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Your recent downloads (stored locally)
                  </CardDescription>
                </div>
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                >
                  Clear History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setUrl(item.url)}
                  >
                    <div className="flex items-center gap-4">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="w-20 h-14 object-cover rounded border border-white/20"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{item.title}</div>
                        <div className="text-sm text-purple-300 flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-200 text-xs">
                            {item.platform}
                          </Badge>
                          <span className="text-xs">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Bar */}
        <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-indigo-900/50 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-white mb-2">{formatNumber(stats.platforms)}+</div>
              <div className="text-purple-200 font-medium">Supported Platforms</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">{formatNumber(stats.downloads)}+</div>
              <div className="text-purple-200 font-medium">Downloads Today</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">{formatNumber(stats.users)}+</div>
              <div className="text-purple-200 font-medium">Happy Users</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-purple-300 text-sm">
            <p className="mb-2">
              <strong className="text-white">ReloadTheGraphics</strong> - Free Online Video Downloader
            </p>
            <p className="text-xs text-purple-400">
              Download videos from YouTube, Instagram, TikTok, Facebook, Twitter, and 1000+ more platforms.
              No registration required. 100% free forever.
            </p>
            <p className="mt-4 text-xs text-purple-500">
              Downloading copyrighted material is prohibited. Please respect creators' rights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UltimateHomePage;
