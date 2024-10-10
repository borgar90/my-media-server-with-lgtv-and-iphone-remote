import React from 'react'
import { Play, SkipBack, SkipForward } from 'lucide-react'

const MusicPlayer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="https://via.placeholder.com/40" alt="Album art" className="w-10 h-10 rounded" />
          <div>
            <p className="font-medium">Song Title</p>
            <p className="text-sm text-gray-500">Artist Name</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <SkipBack size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Play size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer