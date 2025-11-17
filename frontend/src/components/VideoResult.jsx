import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, FileVideo, FileAudio, Clock, HardDrive } from 'lucide-react';

const VideoResult = ({ data, onDownload }) => {
  const videoFormats = data.formats.filter((f) => f.type === 'video');
  const audioFormats = data.formats.filter((f) => f.type === 'audio');

  const FormatButton = ({ format }) => (
    <Button
      onClick={() => onDownload(format)}
      variant="outline"
      className="w-full justify-between h-auto py-3 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
    >
      <div className="flex items-center gap-3">
        {format.type === 'video' ? (
          <FileVideo className="w-5 h-5 text-indigo-600" />
        ) : (
          <FileAudio className="w-5 h-5 text-purple-600" />
        )}
        <div className="text-left">
          <div className="font-semibold">{format.quality}</div>
          <div className="text-xs text-slate-500">{format.format.toUpperCase()}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-600">
          <HardDrive className="w-3 h-3" />
          <span className="text-sm">{format.size}</span>
        </div>
        <Download className="w-4 h-4 text-slate-400" />
      </div>
    </Button>
  );

  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <div className="flex items-start gap-4">
          <img
            src={data.thumbnail}
            alt={data.title}
            className="w-32 h-20 object-cover rounded-lg shadow-md"
          />
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{data.title}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Badge variant="secondary" className="font-medium">
                {data.platform}
              </Badge>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {data.duration}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Video Formats */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-900">
            <FileVideo className="w-4 h-4" />
            Video Formats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {videoFormats.map((format, index) => (
              <FormatButton key={index} format={format} />
            ))}
          </div>
        </div>

        {/* Audio Formats */}
        {audioFormats.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-900">
              <FileAudio className="w-4 h-4" />
              Audio Only
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {audioFormats.map((format, index) => (
                <FormatButton key={index} format={format} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoResult;