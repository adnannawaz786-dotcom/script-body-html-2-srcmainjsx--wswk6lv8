import React, { useState, useEffect } from 'react';
import { Plus, Play, MoreVertical, Music, Trash2, Edit3 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [deletePlaylistId, setDeletePlaylistId] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  useEffect(() => {
    loadPlaylists();
    loadSongs();
  }, []);

  const loadPlaylists = () => {
    const savedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(savedPlaylists);
  };

  const loadSongs = () => {
    const savedSongs = JSON.parse(localStorage.getItem('songs') || '[]');
    setSongs(savedSongs);
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist = {
      id: Date.now(),
      name: newPlaylistName,
      songs: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setNewPlaylistName('');
    setIsCreateDialogOpen(false);
  };

  const deletePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setDeletePlaylistId(null);
  };

  const updatePlaylistName = (playlistId, newName) => {
    if (!newName.trim()) return;
    
    const updatedPlaylists = playlists.map(p => 
      p.id === playlistId ? { ...p, name: newName } : p
    );
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setEditingPlaylist(null);
  };

  const addSongsToPlaylist = (playlistId, selectedSongIds) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const newSongs = selectedSongIds.filter(songId => 
          !playlist.songs.some(s => s.id === songId)
        ).map(songId => songs.find(s => s.id === songId)).filter(Boolean);
        
        return {
          ...playlist,
          songs: [...playlist.songs, ...newSongs]
        };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    setIsAddSongsDialogOpen(false);
    setSelectedPlaylist(null);
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(s => s.id !== songId)
        };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };

  const playPlaylist = (playlist) => {
    if (playlist.songs.length > 0) {
      const event = new CustomEvent('playTrack', { 
        detail: { 
          song: playlist.songs[0],
          playlist: playlist.songs 
        } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Playlists</h1>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Playlists Grid */}
        <div className="grid gap-4">
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto text-white/50 mb-4" />
              <p className="text-white/70 mb-4">No playlists yet</p>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
              >
                Create Your First Playlist
              </button>
            </div>
          ) : (
            playlists.map(playlist => (
              <div key={playlist.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    {editingPlaylist === playlist.id ? (
                      <input
                        type="text"
                        defaultValue={playlist.name}
                        className="bg-transparent border-b border-white/30 text-white text-lg font-semibold focus:outline-none focus:border-white/60"
                        onBlur={(e) => updatePlaylistName(playlist.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updatePlaylistName(playlist.id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
                    )}
                    <p className="text-white/60 text-sm">{playlist.songs.length} songs</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {playlist.songs.length > 0 && (
                      <button
                        onClick={() => playPlaylist(playlist)}
                        className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                      >
                        <Play size={20} />
                      </button>
                    )}
                    
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="p-2 rounded-full hover:bg-white/10 text-white transition-all">
                          <MoreVertical size={20} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-2 min-w-[160px]">
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded cursor-pointer"
                            onClick={() => {
                              setSelectedPlaylist(playlist);
                              setIsAddSongsDialogOpen(true);
                            }}
                          >
                            <Plus size={16} />
                            Add Songs
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded cursor-pointer"
                            onClick={() => setEditingPlaylist(playlist.id)}
                          >
                            <Edit3 size={16} />
                            Rename
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                            onClick={() => setDeletePlaylistId(playlist.id)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </div>

                {/* Playlist Songs */}
                {playlist.songs.length > 0 && (
                  <div className="space-y-2">
                    {playlist.songs.slice(0, 3).map(song => (
                      <div key={song.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                            <Music size={16} className="text-white" />
                          </div>
                          <span className="text-white text-sm">{song.name}</span>
                        </div>
                        <button
                          onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                          className="p-1 text-white/50 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {playlist.songs.length > 3 && (
                      <p className="text-white/60 text-sm text-center">
                        +{playlist.songs.length - 3} more songs
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Playlist Dialog */}
        <Dialog.Root open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-xl font-semibold text-white mb-4">
                Create New Playlist
              </Dialog.Title>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
              />
              <div className="flex justify-end gap-3 mt-6">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-white/70 hover:text-white transition-colors">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={createPlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Add Songs Dialog */}
        <AddSongsDialog
          isOpen={isAddSongsDialogOpen}
          onClose={() => {
            setIsAddSongsDialogOpen(false);
            setSelectedPlaylist(null);
          }}
          playlist={selectedPlaylist}
          availableSongs={songs}
          onAddSongs={addSongsToPlaylist}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog.Root open={!!deletePlaylistId} onOpenChange={() => setDeletePlaylistId(null)}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-6 w-full max-w-md">
              <AlertDialog.Title className="text-xl font-semibold text-white mb-2">
                Delete Playlist
              </AlertDialog.Title>
              <AlertDialog.Description className="text-white/70 mb-6">
                Are you sure you want to delete this playlist? This action cannot be undone.
              </AlertDialog.Description>
              <div className="flex justify-end gap-3">
                <AlertDialog.Cancel asChild>
                  <button className="px-4 py-2 text-white/70 hover:text-white transition-colors">
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={() => deletePlaylist(deletePlaylistId)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

const AddSongsDialog = ({ isOpen, onClose, playlist, availableSongs, onAddSongs }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);

  const toggleSong = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleAddSongs = () => {
    if (playlist && selectedSongs.length > 0) {
      onAddSongs(playlist.id, selectedSongs);
      setSelectedSongs([]);
    }
  };

  const playlistSongIds = playlist?.songs.map(s => s.id) || [];
  const availableToAdd = availableSongs.filter(song => !playlistSongIds.includes(song.id));

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <Dialog.Title className="text-xl font-semibold text-white mb-4">
            Add Songs to {playlist?.name}
          </Dialog.Title>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {availableToAdd.length === 0 ? (
              <p className="text-white/60 text-center py-4">
                All songs are already in this playlist
              </p>
            ) : (
              availableToAdd.map(song => (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedSongs.includes(song.id)
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => toggleSong(song.id)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <Music size={20} className="text-white" />
                  </div>
                  <span className="text-white flex-1">{song.name}</span>
                  {selectedSongs.includes(song.id) && (
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-white/70 hover:text-white transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleAddSongs}
              disabled={selectedSongs.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Add {selectedSongs.length} Songs
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Playlist;