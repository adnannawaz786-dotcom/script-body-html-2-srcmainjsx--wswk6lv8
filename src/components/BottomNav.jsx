import { useState } from 'react'
import { Home, Library, Music, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

const BottomNav = ({ 
  activeTab, 
  onTabChange, 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  currentTime = 0,
  duration = 0,
  volume = 1,
  onSeek,
  onVolumeChange 
}) => {
  const [showPlayer, setShowPlayer] = useState(false)

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'playlist', icon: Music, label: 'Playlist' }
  ]

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeekChange = (e) => {
    const newTime = (e.target.value / 100) * duration
    onSeek?.(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100
    onVolumeChange?.(newVolume)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Mini Player Bar */}
      {currentSong && (
        <div 
          className="bg-white/10 backdrop-blur-md border-t border-white/20 px-4 py-3 cursor-pointer transition-all duration-300 hover:bg-white/15"
          onClick={() => setShowPlayer(!showPlayer)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">
                  {currentSong.name || 'Unknown Song'}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {currentSong.artist || 'Unknown Artist'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPrevious?.()
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-4 h-4 text-white" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPlayPause?.()
                }}
                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNext?.()
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration > 0 ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeekChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Player */}
      {showPlayer && currentSong && (
        <div className="bg-white/15 backdrop-blur-xl border-t border-white/20 px-6 py-6">
          <div className="max-w-md mx-auto">
            {/* Song Info */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-1">
                {currentSong.name || 'Unknown Song'}
              </h3>
              <p className="text-white/60 text-sm">
                {currentSong.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="100"
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={handleSeekChange}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider mb-2"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={onPrevious}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={onPlayPause}
                className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
              
              <button
                onClick={onNext}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-white/60" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-white' : 'text-white/60'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}

export default BottomNav