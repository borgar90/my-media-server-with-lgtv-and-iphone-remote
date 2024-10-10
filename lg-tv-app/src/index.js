import './styles.css';
import io from 'socket.io-client';

const serverUrl = 'http://localhost:4000'; // Replace with your server's IP when testing on the actual TV
const socket = io(serverUrl);

const statusElement = document.getElementById('status');
const mediaListElement = document.getElementById('mediaList');
const playerElement = document.getElementById('player');

socket.on('connect', () => {
    statusElement.textContent = 'Connected to server';
    socket.emit('register', { type: 'TV', name: 'LG TV' });
    fetchMediaList();
});

socket.on('disconnect', () => {
    statusElement.textContent = 'Disconnected from server';
});

function fetchMediaList() {
    fetch(`${serverUrl}/api/media`)
        .then(response => response.json())
        .then(media => {
            mediaListElement.innerHTML = media.map(item => `
                <div class="media-item" onclick="playMedia('${item.id}')">
                    ${item.title} (${item.type})
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error fetching media:', error);
            statusElement.textContent = 'Error fetching media list';
        });
}

window.playMedia = function(mediaId) {
    playerElement.innerHTML = `<video src="${serverUrl}/api/stream/${mediaId}" controls autoplay></video>`;
    socket.emit('control', { action: 'play', mediaId });
};

// Handle remote control commands
socket.on('control', (command) => {
    const video = playerElement.querySelector('video');
    if (video) {
        switch (command.action) {
            case 'play':
                video.play();
                break;
            case 'pause':
                video.pause();
                break;
            case 'stop':
                video.pause();
                video.currentTime = 0;
                break;
        }
    }
});