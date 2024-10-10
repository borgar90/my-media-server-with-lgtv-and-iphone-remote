import React from 'react'
import { Music, Tv, Smartphone, Settings } from 'lucide-react'
import Sidebar from './components/Sidebar'
import MediaList from './components/MediaList'
import MusicPlayer from './components/MusicPlayer'
import DeviceList from './components/DeviceList'
import ControlPanel from './components/ControlPanel'

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Media Server</h1>
        <ControlPanel />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <MediaList />
          <DeviceList />
        </div>
      </main>
      <MusicPlayer />
    </div>
  )
}

export default App