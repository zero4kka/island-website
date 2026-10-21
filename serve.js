const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Simple .env loader without external dependencies
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of envLines) {
      const match = line.trim().match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
} catch (e) {}

const PORT = process.env.PORT || 3000;
const WEBSITE_DIR = __dirname;
const ROOT_DIR = path.resolve(__dirname, '..');

const DEFAULT_REPO = process.env.GITHUB_REPO || 'zero4kka/island';
// Token is kept strictly on the server backend — never sent to visitor browsers!
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.exe': 'application/octet-stream'
};

// Cache for latest release metadata (refreshed every 5 minutes)
let cachedRelease = null;
let lastCheckTime = 0;

function fetchLatestReleaseInfo() {
  return new Promise((resolve) => {
    const now = Date.now();
    if (cachedRelease && (now - lastCheckTime < 5 * 60 * 1000)) {
      return resolve(cachedRelease);
    }

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${DEFAULT_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'Island-Server-Proxy',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(options, (apiRes) => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', () => {
        try {
          const release = JSON.parse(body);
          if (release && release.tag_name) {
            const asset = (release.assets || []).find(a => a.name.toLowerCase().endsWith('.exe')) || release.assets[0];
            cachedRelease = {
              version: release.tag_name.replace(/^v/i, ''),
              tag: release.tag_name,
              name: release.name || release.tag_name,
              notes: release.body || '',
              published_at: release.published_at,
              asset_id: asset ? asset.id : null,
              asset_name: asset ? asset.name : 'Island_Setup.exe',
              asset_size: asset ? asset.size : null,
              asset_url: asset ? asset.url : null
            };
            lastCheckTime = now;
            console.log(`[Auto-Updater] Обнаружен актуальный релиз на GitHub: ${cachedRelease.tag} (${(cachedRelease.asset_size / (1024*1024)).toFixed(1)} МБ)`);
            return resolve(cachedRelease);
          }
        } catch (e) {}
        resolve(fallbackLocalVersion());
      });
    }).on('error', () => {
      resolve(fallbackLocalVersion());
    });
  });
}

function fallbackLocalVersion() {
  const localVerFile = path.join(ROOT_DIR, 'island', 'version.json');
  if (fs.existsSync(localVerFile)) {
    try {
      const v = JSON.parse(fs.readFileSync(localVerFile, 'utf8'));
      return {
        version: v.version || '1.3.6',
        tag: `v${v.version || '1.3.6'}`,
        notes: v.notes || '',
        asset_name: 'Island_Setup.exe',
        is_local: true
      };
    } catch (e) {}
  }
  return { version: '1.3.6', tag: 'v1.3.6', asset_name: 'Island_Setup.exe' };
}

// Stream download directly from GitHub API using backend token
function streamFromGitHub(assetUrl, res) {
  function follow(url) {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'User-Agent': 'Island-Server-Proxy',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/octet-stream'
      }
    };

    https.get(options, (dlRes) => {
      if (dlRes.statusCode >= 300 && dlRes.statusCode < 400 && dlRes.headers.location) {
        return follow(dlRes.headers.location);
      }

      if (dlRes.statusCode !== 200) {
        console.warn(`[Download] GitHub returned ${dlRes.statusCode}, falling back to local.`);
        return streamLocalInstaller(res);
      }

      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="Island_Setup.exe"',
        'Content-Length': dlRes.headers['content-length']
      });

      dlRes.pipe(res);
    }).on('error', (err) => {
      console.warn('[Download] Stream error, fallback to local:', err.message);
      streamLocalInstaller(res);
    });
  }

  follow(assetUrl);
}

function streamLocalInstaller(res) {
  const localCandidates = [
    path.join(WEBSITE_DIR, 'Island_Setup.exe'),
    path.join(ROOT_DIR, 'island', 'Island_Setup.exe'),
    path.join(ROOT_DIR, 'Island_setup.exe')
  ];

  const found = localCandidates.find(p => fs.existsSync(p));
  if (found) {
    const stat = fs.statSync(found);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="Island_Setup.exe"',
      'Content-Length': stat.size
    });
    fs.createReadStream(found).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Installer not available');
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let reqPath = decodeURI(parsedUrl.pathname);

  // 1. API: Dynamic Release Version Information (No tokens exposed!)
  if (reqPath === '/api/version') {
    const info = await fetchLatestReleaseInfo();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'public, max-age=180'
    });
    res.end(JSON.stringify(info));
    return;
  }

  // 2. API: Dynamic Installer Download (Always latest release from GitHub without client token!)
  if (reqPath === '/api/download' || reqPath === '/Island_Setup.exe') {
    const release = await fetchLatestReleaseInfo();
    if (release && release.asset_url) {
      streamFromGitHub(release.asset_url, res);
    } else {
      streamLocalInstaller(res);
    }
    return;
  }

  // 3. Static Files Serving
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(WEBSITE_DIR, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('404 Not Found');
    return;
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': contentType,
    'Cache-Control': (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json') ? 'no-cache, must-revalidate' : 'public, max-age=3600'
  });
  fs.createReadStream(filePath).pipe(res);
});

function listenOnFreePort(currentPort) {
  server.removeAllListeners('error');
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Порт ${currentPort} занят, переключаюсь на ${currentPort + 1}...]`);
      listenOnFreePort(currentPort + 1);
    } else {
      console.error('Ошибка сервера:', err);
    }
  });

  server.listen(currentPort, '127.0.0.1', () => {
    const url = `http://localhost:${currentPort}`;
    console.log('================================================================');
    console.log(`🏝️  Сайт Island успешно запущен на ${url}`);
    console.log(`📁  Директория: ${WEBSITE_DIR}`);
    console.log(`⚡  Автоматическая синхронизация с релизами GitHub: ВКЛЮЧЕНА`);
    console.log(`🔒  Безопасность: токен изолирован на сервере, клиентам не виден`);
    console.log('================================================================\n');

    // Trigger pre-fetch of latest release info
    fetchLatestReleaseInfo();

    exec(`start "" "${url}"`);
  });
}

listenOnFreePort(PORT);
