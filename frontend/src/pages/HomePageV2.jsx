import { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Download, Link2, History, Loader2, Video } from 'lucide-react';
import { mockExtractedData, detectPlatform, mockDownload } from '../mock';
import VideoResult from '../components/VideoResult';
import DownloadHistory from '../components/DownloadHistory';

const HomePageV2 = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('extract');

  useEffect(() => {
    const savedHistory = localStorage.getItem('downloadHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleExtract = () => {
    setMessage('');
    
    if (!url.trim()) {
      setMessage('Please enter a valid video URL');
      return;
    }

    const platform = detectPlatform(url);
    
    if (platform === 'Unknown') {
      setMessage('Please enter a valid video URL from supported platforms');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const data = {
        ...mockExtractedData,
        platform,
        url,
      };
      
      setExtractedData(data);
      setLoading(false);
      setMessage('Success! Video information extracted');

      const newHistoryItem = {
        id: Date.now().toString(),
        url,
        title: data.title,
        platform,
        timestamp: Date.now(),
        thumbnail: data.thumbnail,
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
    }, 2000);
  };

  const handleDownload = async (format) => {
    setMessage(`Preparing ${format.quality} download...`);
    const result = await mockDownload(format, extractedData?.title);
    if (result.success) {
      setMessage(result.message);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('downloadHistory');
    setMessage('History cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ReloadTheGraphics</h1>
              <p className="text-sm text-slate-600">Universal Media Downloader</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {message && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg text-blue-900">
            {message}
          </div>
        )}
        
        <div className="w-full">
          <div className="grid w-full grid-cols-2 mb-8 gap-2">
            <Button
              type="button"
              onClick={() => setActiveTab('extract')}
              variant={activeTab === 'extract' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Extract Media
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab('history')}
              variant={activeTab === 'history' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
          </div>

          {activeTab === 'extract' && (<div className="space-y-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Enter Video URL
                </CardTitle>
                <CardDescription>
                  Paste any video URL from YouTube, Instagram, TikTok, Twitter, Facebook, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
                    className="flex-1 h-12 text-base"
                  />
                  <Button
                    type="button"
                    onClick={handleExtract}
                    disabled={loading}
                    className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-slate-600">Supported:</span>
                  {['YouTube', 'Instagram', 'TikTok', 'Twitter', 'Facebook', 'Vimeo', '+1000 more'].map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {extractedData && (
              <VideoResult
                data={extractedData}
                onDownload={handleDownload}
              />
            )}
          </div>)}

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
        </div>
      </main>

      <footer className="border-t mt-16 py-8 bg-white/50">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p className="text-sm">
            Built with ❤️ using React, FastAPI & yt-dlp • Supports 1000+ platforms
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePageV2;
