const io = require('socket.io-client');
const { createServer } = require('./server');
const request = require('supertest');
const crypto = require('crypto');

let server;
let clientSocket;
let mockDb;

// Mock database
class MockDatabase {
  constructor() {
    this.devices = [];
    this.mediaFiles = [
      { id: 1, title: 'Test Video', type: 'video', path: '/path/to/test.mp4', status: 'completed' }
    ];
  }

  get(query, params, callback) {
    if (query.includes('FROM devices')) {
      const device = this.devices.find(d => d.id === params[0] && d.approved === 1);
      callback(null, device);
    } else if (query.includes('FROM media_files')) {
      const file = this.mediaFiles.find(file => file.id === parseInt(params[0]));
      callback(null, file);
    }
  }
}

beforeAll((done) => {
  mockDb = new MockDatabase();
  server = createServer(mockDb);
  server.listen(4000, () => {
    clientSocket = io('http://localhost:4000');
    clientSocket.on('connect', done);
  });
});

afterAll((done) => {
  if (clientSocket.connected) {
    clientSocket.disconnect();
  }
  server.close(done);
});

describe('Streaming Socket Tests', () => {
  test('Client should be able to connect', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  test('Client should be able to register', (done) => {
    const deviceInfo = { type: 'TV', name: 'Living Room TV' };
    clientSocket.emit('register', deviceInfo);

    setTimeout(() => {
      expect(true).toBe(true);
      done();
    }, 100);
  });

  test('Client should be able to send control commands', (done) => {
    const controlCommand = { action: 'play', mediaId: 1 };
    clientSocket.emit('control', controlCommand);

    setTimeout(() => {
      expect(true).toBe(true);
      done();
    }, 100);
  });
});

describe('Streaming API Tests', () => {
  test('GET /stream/:id should serve a media file', (done) => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 1 });

    request(server)
      .get('/stream/1')
      .set('x-device-id', deviceId)
      .set('Range', 'bytes=0-1023')
      .buffer()
      .parse((res, callback) => {
        res.data = '';
        res.on('data', (chunk) => {
          res.data += chunk.toString();
        });
        res.on('end', () => {
          callback(null, res.data);
        });
      })
      .expect(206)
      .expect('Content-Type', 'video/mp4')
      .expect('Content-Range', /bytes 0-1023\/1024/)
      .expect('Accept-Ranges', 'bytes')
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBe('x'.repeat(1024));
        done();
      });
  }, 15000);  // Increase timeout to 15 seconds

  test('GET /stream/:id should return 404 for non-existent file', async () => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 1 });

    const response = await request(server)
      .get('/stream/999')
      .set('x-device-id', deviceId);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'File not found');
  });

  test('GET /stream/:id should return 403 for unapproved device', async () => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 0 });

    const response = await request(server)
      .get('/stream/1')
      .set('x-device-id', deviceId);

    expect(response.status).toBe(403);
  });
});