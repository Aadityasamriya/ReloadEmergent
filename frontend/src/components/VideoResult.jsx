import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, FileVideo, FileAudio, Clock, HardDrive, Eye, TrendingUp, Sparkles, CheckCircle, ExternalLink, Play } from 'lucide-react';

const VideoResult = ({ data, method }) => {
  const [downloading, setDownloading] = useState({});
  
  // Filter and categorize formats
  const videoFormats = data.formats?.filter((f) => f.type === 'video' && f.has_video && f.has_audio) || [];
  const videoOnlyFormats = data.formats?.filter((f) => f.type === 'video-only' && f.has_video && !f.has_audio) || [];
  const audioFormats = data.formats?.filter((f) => f.type === 'audio' && !f.has_video && f.has_audio) || [];

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count) => {
    if (!count || count === 0) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  const handleDownload = async (format) => {
    const formatKey = `${format.format_id}_${format.quality}`;
    setDownloading(prev => ({ ...prev, [formatKey]: true }));

    try {
      // Open the download URL in a new tab
      if (format.url) {
        window.open(format.url, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setTimeout(() => {
        setDownloading(prev => ({ ...prev, [formatKey]: false }));
      }, 2000);
    }
  };

  const FormatButton = ({ format }) => {
    const formatKey = `${format.format_id}_${format.quality}`;
    const isDownloading = downloading[formatKey];
    
    // Get quality badge color
    const getQualityColor = (quality) => {
      const q = quality.toLowerCase();
      if (q.includes('2160') || q.includes('4k')) return 'from-red-500 to-pink-500';
      if (q.includes('1440') || q.includes('2k')) return 'from-orange-500 to-red-500';
      if (q.includes('1080')) return 'from-purple-500 to-pink-500';
      if (q.includes('720')) return 'from-blue-500 to-purple-500';
      if (q.includes('480')) return 'from-green-500 to-blue-500';
      if (q.includes('360')) return 'from-teal-500 to-green-500';
      if (q.includes('audio')) return 'from-indigo-500 to-purple-500';
      return 'from-slate-500 to-slate-600';
    };

    return (
      <div className="group relative bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
        {/* Quality Badge */}
        <div className="absolute -top-3 left-4">
          <Badge className={`bg-gradient-to-r ${getQualityColor(format.quality)} text-white px-3 py-1 shadow-lg font-bold text-xs`}>
            {format.quality}
          </Badge>
        </div>

        <div className="mt-2 space-y-3">
          {/* Format Info */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${
              format.type === 'audio' ? 'from-purple-100 to-indigo-100' : 'from-blue-100 to-purple-100'
            }`}>
              {format.type === 'audio' ? (
                <FileAudio className="w-5 h-5 text-purple-600" />
              ) : (
                <FileVideo className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{format.ext?.toUpperCase() || 'MP4'}</div>
              <div className="text-xs text-slate-500">
                {format.resolution || (format.type === 'audio' ? 'Audio Format' : 'Video Format')}
              </div>
            </div>
          </div>

          {/* Size Info */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-900">{format.filesize_readable}</span>
            </div>
            {format.fps && format.fps > 0 && (
              <Badge variant="secondary" className="text-xs">
                {format.fps}fps
              </Badge>
            )}
          </div>

          {/* Download Button */}
          <Button
            onClick={() => handleDownload(format)}
            disabled={isDownloading}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 group-hover:scale-105"
          >
            {isDownloading ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-bounce" />
                Opening...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download
                <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden animate-in slide-in-from-bottom">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5"></div>
      
      {/* Header with Video Info */}
      <CardHeader className="relative bg-gradient-to-r from-slate-50 to-purple-50 border-b border-purple-100 pb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Thumbnail */}
          {data.thumbnail && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={data.thumbnail}
                alt={data.title}
                className="relative w-full md:w-48 h-32 object-cover rounded-2xl shadow-xl border-2 border-white"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          )}
          
          {/* Video Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <CardTitle className="text-2xl font-bold text-slate-900 leading-tight flex-1">
                {data.title}
              </CardTitle>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 shadow-lg">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="secondary" className="font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                {data.platform}
              </Badge>
              
              {method && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  via {method}
                </Badge>
              )}
              
              {data.duration > 0 && (
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatDuration(data.duration)}</span>
                </div>
              )}
              
              {data.view_count > 0 && (
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-medium">{formatViews(data.view_count)}</span>
                </div>
              )}
            </div>

            {/* Uploader */}
            {data.uploader && data.uploader !== 'Unknown' && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">By:</span> {data.uploader}
              </div>
            )}

            {/* Format Count */}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-700">
                {data.formats?.length || 0} format{data.formats?.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-8 space-y-8">
        {/* Video Formats */}
        {videoFormats.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <FileVideo className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Video Formats (with Audio)</h3>
              <Badge variant="secondary" className="ml-auto">{videoFormats.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videoFormats.map((format, index) => (
                <FormatButton key={`video-${index}`} format={format} />
              ))}
            </div>
          </div>
        )}

        {/* Video Only Formats */}
        {videoOnlyFormats.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <FileVideo className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Video Only (No Audio)</h3>
              <Badge variant="secondary" className="ml-auto">{videoOnlyFormats.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videoOnlyFormats.map((format, index) => (
                <FormatButton key={`video-only-${index}`} format={format} />
              ))}
            </div>
          </div>
        )}

        {/* Audio Formats */}
        {audioFormats.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                <FileAudio className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Audio Only</h3>
              <Badge variant="secondary" className="ml-auto">{audioFormats.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {audioFormats.map((format, index) => (
                <FormatButton key={`audio-${index}`} format={format} />
              ))}
            </div>
          </div>
        )}

        {/* No formats found */}
        {(!data.formats || data.formats.length === 0) && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">
              <FileVideo className="w-16 h-16 mx-auto mb-4" />
            </div>
            <p className="text-slate-600">No downloadable formats found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoResult;