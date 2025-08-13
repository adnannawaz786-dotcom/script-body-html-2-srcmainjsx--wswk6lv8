import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Music } from 'lucide-react';

const Home = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  useEffect(() => {
    // Load recently played songs from localStorage
    const loadRecentlyPlayed = () => {
      try {
        const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        setRecentlyPlayed(recent.slice(0, 10)); // Show last 10 songs
      } catch (error) {
        console.error('Error loading recently played:', error);
        setRecentlyPlayed([]);
      }
    };

    loadRecentlyPlayed();

    // Listen for storage changes to update recently played
    const handleStorageChange = () => {
      loadRecentlyPlayed();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handlePlay = (song) => {
    // Dispatch custom event to play song in AudioPlayer
    const event = new CustomEvent('playSong', {
      detail: { song }
    });
    window.dispatchEvent(event);
    setCurrentPlayingId(song.id);
  };

  const handlePause = () => {
    // Dispatch custom event to pause song
    const event = new CustomEvent('pauseSong');
    window.dispatchEvent(event);
    setCurrentPlayingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Good Evening</h1>
        <p className="text-gray-300">Welcome back to your music</p>
      </div>

      {/* Recently Played Section */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Clock className="w-6 h-6 text-white mr-3" />
          <h2 className="text-2xl font-semibold text-white">Recently Played</h2>
        </div>

        {recentlyPlayed.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Recent Activity</h3>
            <p className="text-gray-300">Start playing some music to see your recently played songs here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentlyPlayed.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {/* Album Art Placeholder */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Music className="w-6 h-6 text-white" />
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate group-hover:text-purple-200 transition-colors">
                        {song.name || 'Unknown Song'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-300 mt-1">
                        <span className="truncate">
                          {song.artist || 'Unknown Artist'}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex-shrink-0">
                          {formatDate(song.lastPlayed)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration and Play Button */}
                  <div className="flex items-center ml-4">
                    <span className="text-gray-300 text-sm mr-4 hidden sm:block">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => currentPlayingId === song.id ? handlePause() : handlePlay(song)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      {currentPlayingId === song.id ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {recentlyPlayed.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {recentlyPlayed.length}
            </div>
            <div className="text-gray-300 text-sm">Songs Played</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {Math.floor(recentlyPlayed.reduce((acc, song) => acc + (song.duration || 0), 0) / 60)}m
            </div>
            <div className="text-gray-300 text-sm">Total Time</div>
          </div>
        </div>
      )}

      {/* Continue Listening Section */}
      {recentlyPlayed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Continue Listening</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">
                  {recentlyPlayed[0]?.name || 'Last Played Song'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {recentlyPlayed[0]?.artist || 'Unknown Artist'}
                </p>
              </div>
              <button
                onClick={() => handlePlay(recentlyPlayed[0])}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <Play className="w-6 h-6 text-white ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;