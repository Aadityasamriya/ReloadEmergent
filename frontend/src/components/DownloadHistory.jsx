import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, ExternalLink, Clock, History, Sparkles, Play } from 'lucide-react';

const DownloadHistory = ({ history, onClear, onSelect }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    // Return formatted date for older items
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (history.length === 0) {
    return (
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <CardContent className="relative py-20 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-full">
              <History className="w-16 h-16 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No History Yet</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Start extracting videos to see them appear here. Your download history will be saved locally.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5"></div>
        
        <CardHeader className="relative border-b border-purple-100 bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Download History</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  {history.length} item{history.length !== 1 ? 's' : ''} • Stored locally
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onClear}
              variant="destructive"
              className="gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative p-6 space-y-3 max-h-[600px] overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="group relative flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelect(item)}
            >
              {/* Thumbnail */}
              <div className="relative shrink-0">
                {item.thumbnail ? (
                  <>
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-32 h-20 object-cover rounded-xl shadow-md border-2 border-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-32 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Play className="w-8 h-8 text-purple-600" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-semibold text-slate-900 truncate text-base group-hover:text-purple-700 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-gradient-to-r from-violet-50 to-purple-50 text-purple-700 border border-purple-200"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {item.platform}
                  </Badge>
                  {item.method && (
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {item.method}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-50 hover:bg-purple-100 text-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Load
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadHistory;