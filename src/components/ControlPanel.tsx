import React, { useState, useEffect } from 'react'
import { Server, HardDrive, Download, Play } from 'lucide-react'

interface ServerStatus {
  status: string;
  storageUsed: number;
  storageTotal: number;
  activeDownloads: number;
  activeStreams: number;
}

const ControlPanel: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'unknown',
    storageUsed: 0,
    storageTotal: 1,
    activeDownloads: 0,
    activeStreams: 0,
  });

  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchServerStatus = async () => {
    try {
      const response = await fetch('/api/server-status');
      const data = await response.json();
      setServerStatus(data);
    } catch (error) {
      console.error('Failed to fetch server status:', error);
      setServerStatus(prev => ({ ...prev, status: 'offline' }));
    }
  };

  const handleRestart = async () => {
    try {
      await fetch('/api/restart-server', { method: 'POST' });
      alert('Server restart initiated');
    } catch (error) {
      console.error('Failed to restart server:', error);
      alert('Failed to restart server');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Server Control Panel</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-center space-x-2">
          <Server size={24} />
          <span className="font-semibold">Status:</span>
          <span className={`px-2 py-1 rounded-full text-sm ${
            serverStatus.status === 'online' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}>
            {serverStatus.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <HardDrive size={24} />
          <span className="font-semibold">Storage:</span>
          <span>{`${serverStatus.storageUsed} / ${serverStatus.storageTotal} GB`}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Download size={24} />
          <span className="font-semibold">Active Downloads:</span>
          <span>{serverStatus.activeDownloads}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Play size={24} />
          <span className="font-semibold">Active Streams:</span>
          <span>{serverStatus.activeStreams}</span>
        </div>
        <div className="col-span-2">
          <button
            onClick={handleRestart}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Restart Server
          </button>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel