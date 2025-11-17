// Mock data for frontend-only testing

export const mockPlatforms = [
  { name: 'YouTube', icon: 'Youtube', color: '#FF0000' },
  { name: 'Instagram', icon: 'Instagram', color: '#E4405F' },
  { name: 'TikTok', icon: 'Music', color: '#000000' },
  { name: 'Twitter', icon: 'Twitter', color: '#1DA1F2' },
  { name: 'Facebook', icon: 'Facebook', color: '#1877F2' },
  { name: 'Vimeo', icon: 'Video', color: '#1AB7EA' },
];

export const mockExtractedData = {
  title: 'Sample Video Title - Amazing Content',
  thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
  duration: '5:23',
  platform: 'YouTube',
  formats: [
    { quality: '1080p', format: 'mp4', size: '125 MB', type: 'video' },
    { quality: '720p', format: 'mp4', size: '78 MB', type: 'video' },
    { quality: '480p', format: 'mp4', size: '42 MB', type: 'video' },
    { quality: '360p', format: 'mp4', size: '28 MB', type: 'video' },
    { quality: 'Audio Only', format: 'mp3', size: '5.2 MB', type: 'audio' },
  ],
};

export const mockHistory = [
  {
    id: '1',
    url: 'https://youtube.com/watch?v=example1',
    title: 'How to Build Amazing Apps',
    platform: 'YouTube',
    timestamp: Date.now() - 3600000,
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
  },
  {
    id: '2',
    url: 'https://instagram.com/p/example',
    title: 'Instagram Reel Content',
    platform: 'Instagram',
    timestamp: Date.now() - 7200000,
    thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&q=80',
  },
];

export const detectPlatform = (url) => {
  if (!url) return 'Unknown';
  
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'YouTube';
  if (urlLower.includes('instagram.com')) return 'Instagram';
  if (urlLower.includes('tiktok.com')) return 'TikTok';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'Twitter';
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'Facebook';
  if (urlLower.includes('vimeo.com')) return 'Vimeo';
  
  return 'Other';
};

export const mockDownload = (format, title) => {
  // Simulate download delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Download started: ${title} (${format.quality})`,
      });
    }, 1000);
  });
};