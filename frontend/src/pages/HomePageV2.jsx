import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Download, Link2, History, Loader2, Video, CheckCircle, AlertCircle, Sparkles, TrendingUp, Clock, Eye } from 'lucide-react';
import VideoResult from '../components/VideoResult';
import DownloadHistory from '../components/DownloadHistory';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const HomePageV2 = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('extract');
  const [extractionMethod, setExtractionMethod] = useState('');

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
    setSuccess('');
    setExtractedData(null);
    
    if (!url.trim()) {
      setError('Please enter a valid video URL');
      return;
    }

    // Basic URL validation
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
        timeout: 60000 // 60 second timeout
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Premium Header with Glassmorphism */}
      <header className="border-b border-white/20 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-purple-500/5">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-3 rounded-2xl shadow-xl">
                  <Download className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ReloadTheGraphics
                </h1>
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Ultimate Media Downloader • 1000+ Platforms
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border-purple-200">
              <CheckCircle className="w-3 h-3" />
              Production Ready
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="inline-flex bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg border border-white/20">
            <Button
              type="button"
              onClick={() => setActiveTab('extract')}
              variant={activeTab === 'extract' ? 'default' : 'ghost'}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'extract' 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="font-semibold">Extract Media</span>
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab('history')}
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="font-semibold">History</span>
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-white/90 text-purple-700">
                  {history.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Extract Tab */}
        {activeTab === 'extract' && (
          <div className="space-y-8">
            {/* URL Input Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5"></div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                    <Link2 className="w-6 h-6 text-purple-600" />
                  </div>
                  Enter Video URL
                </CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Paste any video URL from YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo, and 1000+ platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Input Section */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="https://youtube.com/watch?v=example or any video URL..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleExtract()}
                      disabled={loading}
                      className="h-14 text-base px-5 pr-12 rounded-2xl border-2 border-slate-200 focus:border-purple-400 bg-white shadow-sm"
                    />
                    <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  <Button
                    type="button"
                    onClick={handleExtract}
                    disabled={loading || !url.trim()}
                    className="h-14 px-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-purple-500/30 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

                {/* Supported Platforms */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Supported Platforms:
                    </span>
                    {['YouTube', 'Instagram', 'TikTok', 'Twitter/X', 'Facebook', 'Vimeo', 'Dailymotion', 'Reddit', '+1000 more'].map((platform) => (
                      <Badge 
                        key={platform} 
                        variant="secondary" 
                        className="text-xs px-3 py-1 bg-gradient-to-r from-violet-50 to-purple-50 text-purple-700 border border-purple-200 hover:from-violet-100 hover:to-purple-100 transition-colors"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {[
                    { icon: CheckCircle, text: 'Multi-level extraction', color: 'text-green-600' },
                    { icon: Sparkles, text: 'Best quality detection', color: 'text-purple-600' },
                    { icon: Download, text: 'Direct download links', color: 'text-blue-600' }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {extractedData && (
              <VideoResult
                data={extractedData}
                method={extractionMethod}
              />
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <DownloadHistory
            history={history}
            onClear={clearHistory}
            onSelect={(item) => {
              setUrl(item.url);
              setActiveTab('extract');
            }}
          />
        )}
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-white/20 mt-20 py-10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-medium">
                Built with cutting-edge technology • React + FastAPI + yt-dlp
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                1000+ Platforms Supported
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Multi-level Extraction
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3 text-blue-500" />
                Direct Downloads
              </span>
            </div>
            <p className="text-xs text-slate-500">
              © 2025 ReloadTheGraphics • Premium Video Downloader
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePageV2;
