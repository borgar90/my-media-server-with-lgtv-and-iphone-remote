import React from 'react'
import { Music, Tv, Smartphone, Settings } from 'lucide-react'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Tv size={20} />
              <span>Video</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Music size={20} />
              <span>Music</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Smartphone size={20} />
              <span>Remote Control</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar