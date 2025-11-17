import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, ExternalLink, Clock } from 'lucide-react';

const DownloadHistory = ({ history, onClear, onSelect }) => {
  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (history.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-16 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No History Yet</h3>
          <p className="text-slate-600">Your download history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Download History</CardTitle>
              <CardDescription>{history.length} items</CardDescription>
            </div>
            <Button
              onClick={onClear}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-24 h-16 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate mb-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Badge variant="secondary" className="text-xs">
                    {item.platform}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item);
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadHistory;