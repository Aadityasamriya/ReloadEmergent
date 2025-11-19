# ReloadTheGraphics - Ultimate Video Downloader

🚀 **The most powerful web-based video downloader supporting 1000+ platforms**

## ✨ Features

### 🎥 Download Videos
- **1000+ Platform Support**: YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo, Dailymotion, and more
- **Multiple Quality Options**: Choose from available qualities (4K, 1080p, 720p, 480p, etc.)
- **File Size Display**: See exact file sizes before downloading
- **Direct Download Links**: No redirects, instant downloads

### 🎵 Audio Extraction
- Extract audio from any video
- Multiple formats: MP3, M4A, AAC, OGG
- High-quality audio preservation
- Quick conversion process

### 📝 Subtitle Download
- Download subtitles and closed captions
- Multiple languages supported
- Both manual and auto-generated captions
- SRT, VTT, and other formats

### 🎨 Premium UI/UX
- Beautiful dark theme with glassmorphism effects
- Animated gradient backgrounds
- Responsive design for all devices
- Smooth transitions and loading states

### 📱 Mobile Friendly
- Works on all devices (Desktop, Tablet, Mobile)
- PWA support (Add to Home Screen)
- Touch-optimized interface
- Fast and lightweight

### 🔒 Privacy & Security
- No registration required
- No data collection
- LocalStorage only (no database)
- 100% client-side history
- Open source and transparent

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Video Extraction**: yt-dlp (1000+ platform support)
- **Browser Automation**: Playwright (fallback method)
- **HTML Parsing**: BeautifulSoup4 (last resort)
- **Async Processing**: asyncio for concurrent operations

### Frontend
- **Framework**: React 18
- **UI Components**: Radix UI + Custom components
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (running locally)

### Installation

1. **Clone the repository**
```bash
cd /app
```

2. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install Frontend Dependencies**
```bash
cd frontend
yarn install
```

4. **Start Services**
```bash
# Start all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api/
- API Docs: http://localhost:8001/docs

## 📡 API Endpoints

### Extract Video Information
```bash
POST /api/extract
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### Get Subtitles
```bash
POST /api/subtitles
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### Get Supported Formats
```bash
GET /api/formats
```

### Health Check
```bash
GET /api/health
```

## 🎯 How It Works

### Multi-Level Extraction Waterfall

1. **Level 1: yt-dlp** (Primary)
   - Most comprehensive method
   - Supports 1000+ platforms
   - Extracts all available formats
   - Gets video metadata (title, duration, views, etc.)

2. **Level 2: Playwright** (Fallback)
   - Browser automation
   - Handles JavaScript-heavy sites
   - Optional ScrapingBee proxy support

3. **Level 3: BeautifulSoup** (Last Resort)
   - HTML parsing
   - Simple video element extraction
   - Works for basic embedded videos

## 🎨 UI Features

### Dark Theme
- Sophisticated gradient backgrounds
- Glassmorphism effects
- Smooth animations
- High contrast for readability

### Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch and click optimized

### Loading States
- Skeleton screens
- Progress indicators
- Smooth transitions
- Error boundaries

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```bash
MONGO_URL=mongodb://localhost:27017/video_downloader
SCRAPINGBEE_API_KEY=your_api_key_here  # Optional
CORS_ORIGINS=*
```

**Frontend** (`frontend/.env`):
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📊 Supported Platforms

### Video Platforms
- YouTube
- YouTube Music
- Instagram (Posts, Reels, Stories)
- TikTok
- Twitter/X
- Facebook (Videos, Watch)
- Vimeo
- Dailymotion
- Twitch (Clips, VODs)
- Reddit
- Imgur
- 9GAG
- And 1000+ more...

### Audio Platforms
- SoundCloud
- Bandcamp
- Mixcloud
- And more...

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
tail -50 /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend Not Compiling
```bash
# Check logs
tail -50 /var/log/supervisor/frontend.err.log

# Clear cache and reinstall
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

### Video Extraction Failing
- Check if the URL is valid
- Try a different platform
- Check backend logs for specific errors
- YouTube may require cookies for some videos

## 📝 Known Limitations

1. **YouTube Bot Detection**: YouTube actively blocks automated downloads. Consider using cookies or alternative methods.
2. **Private Videos**: Cannot download private or authentication-required videos.
3. **DRM Content**: Cannot download DRM-protected content.
4. **Georestricted Content**: May not work for region-locked videos.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## ⚖️ Legal Disclaimer

**Important**: This tool is for educational purposes only. Users are responsible for complying with:
- Platform Terms of Service
- Copyright laws
- Fair use policies
- Local regulations

Downloading copyrighted content without permission is illegal. Always respect content creators' rights.

## 📄 License

MIT License - feel free to use this project for learning and personal use.

## 🌟 Features Coming Soon

- [ ] Video trimming/cutting
- [ ] Batch download support
- [ ] Playlist extraction
- [ ] Video format conversion
- [ ] Audio normalization
- [ ] Custom quality selection
- [ ] Download queue management
- [ ] Browser extension

## 📞 Support

If you encounter any issues or have questions, please check the troubleshooting section or review the API documentation.

---

**Made with ❤️ for video enthusiasts worldwide**
