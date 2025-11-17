import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Download, Link2, History, Loader2, Video, Music, Image as ImageIcon } from 'lucide-react';
import { mockExtractedData, mockHistory, detectPlatform, mockDownload } from '../mock';
import { useToast } from '../hooks/use-toast';
import VideoResult from '../components/VideoResult';
import DownloadHistory from '../components/DownloadHistory';

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [history, setHistory] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('downloadHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleExtract = async () => {
    console.log('Extract button clicked', url);
    
    if (!url.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a valid video URL',
        variant: 'destructive',
      });
      return;
    }

    const platform = detectPlatform(url);
    console.log('Detected platform:', platform);
    
    if (platform === 'Unknown') {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid video URL from supported platforms',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    console.log('Loading set to true');
    
    // Mock API call
    setTimeout(() => {
      console.log('Timeout callback executing');
      const data = {
        ...mockExtractedData,
        platform,
        url,
      };
      console.log('Setting extracted data:', data);
      setExtractedData(data);
      setLoading(false);
      console.log('Loading set to false');
      
      toast({
        title: 'Success!',
        description: 'Video information extracted successfully',
      });

      // Add to history
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
      console.log('History updated');
    }, 2000);
  };

  const handleDownload = async (format) => {
    toast({
      title: 'Download Starting',
      description: `Preparing ${format.quality} download...`,
    });

    const result = await mockDownload(format, extractedData.title);
    
    if (result.success) {
      toast({
        title: 'Download Ready',
        description: result.message,
      });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('downloadHistory');
    toast({
      title: 'History Cleared',
      description: 'Download history has been cleared',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="extract" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Extract Media
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-6">
            {/* URL Input Section */}
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

                {/* Supported Platforms */}
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

            {/* Result Section */}
            {extractedData && (
              <VideoResult
                data={extractedData}
                onDownload={handleDownload}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <DownloadHistory
              history={history}
              onClear={clearHistory}
              onSelect={(item) => {
                setUrl(item.url);
                // Switch to extract tab
                document.querySelector('[value="extract"]').click();
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
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

export default HomePage;