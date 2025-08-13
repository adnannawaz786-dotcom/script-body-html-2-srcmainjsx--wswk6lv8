import React, { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home, Music, ListMusic, Play, Pause, SkipBack, SkipForward, Volume2, Plus, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Audio Context for visualizer
let audioContext = null
let analyser = null
let dataArray = null

const App = () => {
  const [currentView, setCurrentView] = useState('home')
  const [songs, setSongs] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [visualizerData, setVisualizerData] = useState(new Array(64).fill(0))
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  const audioRef = useRef(null)
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSongs = localStorage.getItem('musicApp_songs')
    const savedPlaylists = localStorage.getItem('musicApp_playlists')
    const savedRecent = localStorage.getItem('musicApp_recent')

    if (savedSongs) setSongs(JSON.parse(savedSongs))
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists))
    if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent))
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('musicApp_songs', JSON.stringify(songs))
  }, [songs])

  useEffect(() => {
    localStorage.setItem('musicApp_playlists', JSON.stringify(playlists))
  }, [playlists])

  useEffect(() => {
    localStorage.setItem('musicApp_recent', JSON.stringify(recentlyPlayed))
  }, [recentlyPlayed])

  // Initialize audio context and analyser
  const initAudioContext = () => {
    if (!audioContext && audioRef.current) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      analyser.fftSize = 128
      dataArray = new Uint8Array(analyser.frequencyBinCount)
    }
  }

  // Visualizer animation
  const updateVisualizer = () => {
    if (analyser && dataArray && isPlaying) {
      analyser.getByteFrequencyData(dataArray)
      setVisualizerData([...dataArray])
    }
    animationRef.current = requestAnimationFrame(updateVisualizer)
  }

  useEffect(() => {
    if (isPlaying) {
      updateVisualizer()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file)
        const newSong = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          url: url,
          file: file
        }
        setSongs(prev => [...prev, newSong])
      }
    })
    setShowUploadDialog(false)
  }

  // Play song
  const playSong = (song) => {
    if (currentSong?.id !== song.id) {
      setCurrentSong(song)
      if (audioRef.current) {
        audioRef.current.src = song.url
      }
      // Add to recently played
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(s => s.id !== song.id)
        return [song, ...filtered].slice(0, 10)
      })
    }
    setIsPlaying(true)
    initAudioContext()
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
        initAudioContext()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Create new playlist
  const createPlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: Date.now(),
        name: newPlaylistName,
        songs: []
      }
      setPlaylists(prev => [...prev, newPlaylist])
      setNewPlaylistName('')
      setShowPlaylistDialog(false)
    }
  }

  // Add song to playlist
  const addToPlaylist = (song, playlistId) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, songs: [...playlist.songs, song] }
        : playlist
    ))
  }

  // Navigation items
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'library', icon: Music, label: 'Library' },
    { id: 'playlist', icon: ListMusic, label: 'Playlist' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
        volume={volume}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/mpeg" 
        multiple
        className="hidden"
      />

      {/* Main Content */}
      <div className="pb-32 px-4 pt-8">
        {/* Home View */}
        {currentView === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold mb-8">Recently Played</h1>
            {recentlyPlayed.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No recently played songs</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {recentlyPlayed.map((song) => (
                  <motion.div
                    key={song.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{song.name}</h3>
                        <p className="text-sm text-gray-300">{song.artist}</p>
                      </div>
                      <Play className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Library View */}
        {currentView === 'library' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Library</h1>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            
            {songs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No songs in library</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Upload Songs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {songs.map((song) => (
                  <motion.div
                    key={song.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 cursor-pointer"
                    onClick={() => playSong(song)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{song.name}</h3>
                        <p className="text-sm text-gray-300">{song.artist}</p>
                      </div>
                      <Play className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Playlist View */}
        {currentView === 'playlist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Playlists</h1>
              <button
                onClick={() => setShowPlaylistDialog(true)}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ListMusic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No playlists created</p>
                <button
                  onClick={() => setShowPlaylistDialog(true)}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {playlists.map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <ListMusic className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{playlist.name}</h3>
                        <p className="text-sm text-gray-300">{playlist.songs.length} songs</p>
                      </div>
                    </div>
                    {playlist.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center space-x-3 py-2 px-3 hover:bg-white/5 rounded-lg cursor-pointer"
                        onClick={() => playSong(song)}
                      >
                        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{song.name}</p>
                          <p className="text-xs text-gray-400">{song.artist}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Music Player */}
      {currentSong && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4"
        >
          {/* Visualizer */}
          <div className="flex items-center justify-center mb-4 h-16">
            {visualizerData.slice(0, 32).map((value, index) => (
              <div
                key={index}
                className="w-1 mx-0.5 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, (value / 255) * 64)}px`
                }}
              />
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{currentSong.name}</h3>
              <p className="text-xs text-gray-300">{currentSong.artist}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-full">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlayPause}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="flex justify-around py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'text-purple-400 bg-white/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Playlist Dialog */}
      <AnimatePresence>
        {showPlaylistDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowPlaylistDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Playlist</h3>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPlaylistDialog(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPlaylist}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App