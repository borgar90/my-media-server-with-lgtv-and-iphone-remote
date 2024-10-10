const request = require('supertest');
const { createApp } = require('./server');
const crypto = require('crypto');

let app;
let mockDb;

// Mock database
class MockDatabase {
  constructor() {
    this.devices = [];
    this.mediaFiles = [];
    this.downloadQueue = [];
  }

  run(query, params, callback) {
    if (query.startsWith('INSERT INTO devices')) {
      const [id, name, type, location, timestamp, approved] = params;
      this.devices.push({ id, name, type, location, timestamp, approved });
      callback.call({ lastID: id });
    } else if (query.startsWith('UPDATE devices')) {
      const [approved, id] = params;
      const device = this.devices.find(d => d.id === id);
      if (device) {
        device.approved = approved;
      }
      callback();
    } else if (query.startsWith('INSERT INTO download_queue')) {
      const [url, type, status] = params;
      const id = this.downloadQueue.length + 1;
      this.downloadQueue.push({ id, url, type, status });
      callback.call({ lastID: id });
    } else if (query.startsWith('INSERT INTO media_files')) {
      const [title, type, path, status] = params;
      const id = this.mediaFiles.length + 1;
      this.mediaFiles.push({ id, title, type, path, status });
      callback();
    }
  }

  get(query, params, callback) {
    if (query.includes('FROM devices')) {
      const device = this.devices.find(d => d.id === params[0] && d.approved === 1);
      callback(null, device);
    } else if (query.includes('FROM download_queue')) {
      const item = this.downloadQueue.find(item => item.id === params[0]);
      callback(null, item);
    } else if (query.includes('FROM media_files')) {
      const file = this.mediaFiles.find(file => file.id === parseInt(params[0]));
      callback(null, file);
    }
  }

  all(query, params, callback) {
    if (query.includes('FROM devices')) {
      callback(null, this.devices);
    } else if (query.includes('FROM media_files')) {
      callback(null, this.mediaFiles);
    }
  }
}

beforeAll(() => {
  mockDb = new MockDatabase();
  app = createApp(mockDb);
});

afterEach(() => {
  jest.clearAllMocks();
  mockDb.devices = [];
  mockDb.downloadQueue = [];
  mockDb.mediaFiles = [];
});

describe('Device Authentication Tests', () => {
  test('POST /register-device should register a new device', async () => {
    const response = await request(app)
      .post('/register-device')
      .send({ name: 'Test Device', type: 'TV' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Device registered, waiting for approval');
    expect(response.body).toHaveProperty('deviceId');
  });

  test('POST /approve-device should approve a device', async () => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 0 });

    const response = await request(app)
      .post('/approve-device')
      .send({ deviceId, approved: true });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Device approved');
  });

  test('GET /devices should return list of devices', async () => {
    mockDb.devices.push({ id: 'test-id', name: 'Test Device', type: 'TV', approved: 1 });

    const response = await request(app)
      .get('/devices');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0]).toHaveProperty('name', 'Test Device');
  });
});

describe('Media Server Tests', () => {
  test('POST /queue-download should add item to queue', async () => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 1 });

    const response = await request(app)
      .post('/queue-download')
      .send({ url: 'http://example.com/file.mp4', type: 'direct' })
      .set('x-device-id', deviceId);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Added to download queue');
    expect(response.body).toHaveProperty('id');
  });

  test('GET /media should return list of media files', async () => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 1 });

    mockDb.mediaFiles.push({
      id: 1,
      title: 'Test File',
      type: 'video',
      path: '/path/to/file.mp4',
      status: 'completed'
    });

    const response = await request(app)
      .get('/media')
      .set('x-device-id', deviceId);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0]).toHaveProperty('title', 'Test File');
  });

  test('GET /media should return 403 for unapproved device', async () => {
    const deviceId = crypto.randomBytes(16).toString('hex');
    mockDb.devices.push({ id: deviceId, name: 'Test Device', type: 'TV', approved: 0 });

    const response = await request(app)
      .get('/media')
      .set('x-device-id', deviceId);

    expect(response.status).toBe(403);
  });
});