import React, { useState, useEffect } from 'react'
import { Tv, Smartphone, Laptop, HardDrive } from 'lucide-react'

interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  timestamp: string;
  approved: boolean;
}

const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleApproval = async (deviceId: string, approved: boolean) => {
    try {
      await fetch('/api/approve-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, approved }),
      });
      fetchDevices(); // Refresh the list after approval
    } catch (error) {
      console.error('Failed to update device approval:', error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tv':
        return <Tv size={24} />;
      case 'smartphone':
        return <Smartphone size={24} />;
      case 'laptop':
        return <Laptop size={24} />;
      default:
        return <HardDrive size={24} />;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Connected Devices</h2>
      <ul className="space-y-4">
        {devices.map((device) => (
          <li key={device.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-md">
            <div className="flex items-center space-x-4">
              {getDeviceIcon(device.type)}
              <div>
                <p className="font-semibold">{device.name}</p>
                <p className="text-sm text-gray-600">{device.type}</p>
                <p className="text-xs text-gray-500">{device.location} - {new Date(device.timestamp).toLocaleString()}</p>
              </div>
            </div>
            {device.approved ? (
              <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">Approved</span>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => handleApproval(device.id, true)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(device.id, false)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                >
                  Deny
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DeviceList