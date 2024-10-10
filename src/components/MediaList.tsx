import React from 'react'

const MediaList = () => {
  // This is a placeholder. In a real application, you'd fetch this data from your API
  const mediaItems = [
    { id: 1, title: 'Movie 1', type: 'video' },
    { id: 2, title: 'Song 1', type: 'music' },
    { id: 3, title: 'TV Show 1', type: 'video' },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Media Library</h2>
      <ul className="space-y-2">
        {mediaItems.map((item) => (
          <li key={item.id} className="bg-white p-4 rounded shadow">
            <span className="font-medium">{item.title}</span>
            <span className="ml-2 text-sm text-gray-500">{item.type}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MediaList