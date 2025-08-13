import React, { useState, useRef } from 'react';
import { Plus, Upload, Music, Trash2, Play } from 'lucide-react';

const Library = () => {
  const [songs, setSongs] = useState(() => {
    const saved = localStorage.getItem('musicLibrary');
    return saved ? JSON.parse(saved) : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    for (const file of files) {
      if (file.type.startsWith('audio/')) {
        try {
          const audio = new Audio();
          const fileUrl = URL.createObjectURL(file);
          
          await new Promise((resolve, reject) => {
            audio.onloadedmetadata = () => {
              const newSong = {
                id: Date.now() + Math.random(),
                name: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown Artist',
                duration: Math.floor(audio.duration),
                file: fileUrl,
                uploadDate: new Date().toISOString()
              };

              setSongs(prev => {
                const updated = [...prev, newSong];
                localStorage.setItem('musicLibrary', JSON.stringify(updated));
                return updated;
              });
              
              resolve();
            };
            audio.onerror = reject;
            audio.src = fileUrl;
          });
        } catch (error) {
          console.error('Error processing file:', file.name, error);
        }
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const deleteSong = (songId) => {
    setSongs(prev => {
      const updated = prev.filter(song => song.id !== songId);
      localStorage.setItem('musicLibrary', JSON.stringify(updated));
      return updated;
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSong = (song) => {
    // Dispatch custom event for audio player
    window.dispatchEvent(new CustomEvent('playSong', { detail: song }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Your Library</h1>
          <p className="text-gray-400 text-sm">{songs.length} songs</p>
        </div>
        
        {/* Upload Button */}
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Upload Area */}
      {songs.length === 0 && (
        <div 
          onClick={handleUploadClick}
          className="mb-6 p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 border-dashed cursor-pointer hover:bg-white/10 transition-all duration-300"
        >
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Upload Your Music</h3>
            <p className="text-gray-400 text-sm">
              Click here or use the + button to add songs to your library
            </p>
          </div>
        </div>
      )}

      {/* Songs List */}
      <div className="space-y-3">
        {songs.map((song) => (
          <div
            key={song.id}
            className="group flex items-center p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            {/* Play Button */}
            <button
              onClick={() => playSong(song)}
              className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 mr-4 opacity-0 group-hover:opacity-100"
            >
              <Play className="w-4 h-4 ml-0.5" />
            </button>

            {/* Song Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-4 group-hover:opacity-0 transition-opacity duration-300">
              <Music className="w-5 h-5 text-white" />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{song.name}</h3>
              <p className="text-gray-400 text-sm truncate">{song.artist}</p>
            </div>

            {/* Duration */}
            <div className="text-gray-400 text-sm mr-4">
              {formatDuration(song.duration)}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => deleteSong(song.id)}
              className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="fixed bottom-24 left-4 right-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-white text-sm">Uploading songs...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;