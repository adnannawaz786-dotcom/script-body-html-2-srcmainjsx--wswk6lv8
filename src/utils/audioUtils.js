// Audio handling and visualization utilities

export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = null;
    this.source = null;
    this.isInitialized = false;
  }

  async initializeContext() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  connectAudioElement(audioElement) {
    if (!this.isInitialized) return;
    
    try {
      if (this.source) {
        this.source.disconnect();
      }
      
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Failed to connect audio element:', error);
    }
  }

  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return null;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    return Array.from(this.dataArray);
  }

  getTimeDomainData() {
    if (!this.analyser || !this.dataArray) return null;
    
    this.analyser.getByteTimeDomainData(this.dataArray);
    return Array.from(this.dataArray);
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      return this.audioContext.resume();
    }
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
  }
}

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (duration) => {
  if (!duration) return '0:00';
  
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const validateAudioFile = (file) => {
  const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload MP3, WAV, OGG, or M4A files.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 50MB.');
  }
  
  return true;
};

export const createAudioFromFile = (file) => {
  return new Promise((resolve, reject) => {
    try {
      validateAudioFile(file);
      
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const audioData = {
          id: generateId(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          duration: audio.duration,
          url: url,
          file: file,
          addedAt: new Date().toISOString()
        };
        
        resolve(audioData);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      });
      
      audio.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const createVisualizerBars = (frequencyData, barCount = 64) => {
  if (!frequencyData || frequencyData.length === 0) {
    return new Array(barCount).fill(0);
  }
  
  const bars = [];
  const dataPerBar = Math.floor(frequencyData.length / barCount);
  
  for (let i = 0; i < barCount; i++) {
    const start = i * dataPerBar;
    const end = start + dataPerBar;
    const slice = frequencyData.slice(start, end);
    const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    bars.push(average / 255); // Normalize to 0-1
  }
  
  return bars;
};

export const getAudioMetadata = async (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata = {
        duration: audio.duration,
        title: file.name.replace(/\.[^/.]+$/, ''),
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve({
        duration: 0,
        title: file.name.replace(/\.[^/.]+$/, ''),
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    });
    
    audio.src = url;
  });
};

export const cleanupAudioUrls = (songs) => {
  songs.forEach(song => {
    if (song.url && song.url.startsWith('blob:')) {
      URL.revokeObjectURL(song.url);
    }
  });
};

export const updateRecentlyPlayed = (song, maxItems = 20) => {
  const recentlyPlayed = loadFromLocalStorage('recentlyPlayed', []);
  
  // Remove if already exists
  const filtered = recentlyPlayed.filter(item => item.id !== song.id);
  
  // Add to beginning
  const updated = [
    { ...song, playedAt: new Date().toISOString() },
    ...filtered
  ].slice(0, maxItems);
  
  saveToLocalStorage('recentlyPlayed', updated);
  return updated;
};

export const getRecentlyPlayed = () => {
  return loadFromLocalStorage('recentlyPlayed', []);
};

export const createPlaylist = (name, description = '') => {
  const playlist = {
    id: generateId(),
    name,
    description,
    songs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const playlists = loadFromLocalStorage('playlists', []);
  const updated = [...playlists, playlist];
  saveToLocalStorage('playlists', updated);
  
  return playlist;
};

export const addSongToPlaylist = (playlistId, song) => {
  const playlists = loadFromLocalStorage('playlists', []);
  const updated = playlists.map(playlist => {
    if (playlist.id === playlistId) {
      const songExists = playlist.songs.some(s => s.id === song.id);
      if (!songExists) {
        return {
          ...playlist,
          songs: [...playlist.songs, song],
          updatedAt: new Date().toISOString()
        };
      }
    }
    return playlist;
  });
  
  saveToLocalStorage('playlists', updated);
  return updated;
};

export const removeSongFromPlaylist = (playlistId, songId) => {
  const playlists = loadFromLocalStorage('playlists', []);
  const updated = playlists.map(playlist => {
    if (playlist.id === playlistId) {
      return {
        ...playlist,
        songs: playlist.songs.filter(song => song.id !== songId),
        updatedAt: new Date().toISOString()
      };
    }
    return playlist;
  });
  
  saveToLocalStorage('playlists', updated);
  return updated;
};