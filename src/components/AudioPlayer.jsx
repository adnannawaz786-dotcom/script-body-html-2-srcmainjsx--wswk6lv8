import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

const AudioPlayer = ({ currentSong, playlist = [], onNext, onPrevious, onSongEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [visualizerData, setVisualizerData] = useState(new Array(32).fill(0));
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
      
      // Initialize Web Audio API for visualizer
      if (!audioContextRef.current) {
        initializeAudioContext();
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const initializeAudioContext = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 64;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  const updateVisualizer = () => {
    if (analyserRef.current && isPlaying) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const normalizedData = Array.from(dataArray).map(value => value / 255);
      setVisualizerData(normalizedData);
      
      animationRef.current = requestAnimationFrame(updateVisualizer);
    }
  };

  const togglePlayPause = async () => {
    if (!currentSong || !audioRef.current) return;

    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        updateVisualizer();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value) => {
    const newTime = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0]);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      updateVisualizer();
    } else if (repeatMode === 'all' || playlist.length > 1) {
      handleNext();
    } else {
      onSongEnd?.();
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext(isShuffle);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return (
        <div className="relative">
          <Repeat size={20} />
          <span className="absolute -top-1 -right-1 text-xs">1</span>
        </div>
      );
    }
    return <Repeat size={20} />;
  };

  if (!currentSong) {
    return (
      <div className="fixed bottom-20 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-center h-20 text-white/50">
          No song selected
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      {/* Visualizer */}
      <div className="flex justify-center items-end h-12 px-4 space-x-1">
        {visualizerData.map((height, index) => (
          <div
            key={index}
            className="bg-gradient-to-t from-blue-500 to-purple-500 w-2 rounded-t transition-all duration-100"
            style={{
              height: `${Math.max(2, height * 40)}px`,
              opacity: isPlaying ? 0.8 : 0.3
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
        >
          <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
            <Slider.Range className="absolute bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Slider.Root>
        
        <div className="flex justify-between text-xs text-white/70 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Song Info */}
      <div className="px-4 py-2 text-center">
        <h3 className="text-white font-medium truncate">{currentSong.title}</h3>
        <p className="text-white/70 text-sm truncate">{currentSong.artist}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-blue-500' : 'text-white/70 hover:text-white'
            }`}
          >
            <Shuffle size={20} />
          </button>
          
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'none' ? 'text-blue-500' : 'text-white/70 hover:text-white'
            }`}
          >
            {getRepeatIcon()}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            className="text-white/70 hover:text-white transition-colors"
            disabled={!onPrevious}
          >
            <SkipBack size={24} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all"
          >
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white ml-1" />
            )}
          </button>
          
          <button
            onClick={handleNext}
            className="text-white/70 hover:text-white transition-colors"
            disabled={!onNext}
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Volume2 size={20} className="text-white/70" />
          <Slider.Root
            className="relative flex items-center select-none touch-none w-20 h-5"
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-white rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-lg hover:bg-white/90 focus:outline-none" />
          </Slider.Root>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;