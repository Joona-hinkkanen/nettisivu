'use strict';

/*
 * Nettisivun reaaliaikainen editori.
 *
 * Käynnistys:  node server.js   (tai npm start)
 * Selain:      http://localhost:4173
 *
 * Ei ulkoisia riippuvuuksia. Palvelin
 *  - jakaa tiedostot sellaisenaan (index.html, style.css),
 *  - tallentaa muutokset suoraan levylle,
 *  - välittää muutokset kaikille avoinna oleville selaimille (SSE),
 *  - huomaa myös VS Codessa tehdyt tallennukset ja päivittää selaimet.
 */

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { exec } = require('node:child_process');

const ROOT = __dirname;
const HOST = process.env.HOST || '0.0.0.0';
const portIndex = process.argv.indexOf('--port');
const PORT =
  Number(process.env.PORT) ||
  (portIndex !== -1 ? Number(process.argv[portIndex + 1]) : 0) ||
  4173;
const FILES = ['index.html', 'style.css'];
const MAX_BODY = 2 * 1024 * 1024;
const PRESENCE_TTL = 20_000;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

// ---------------------------------------------------------------------------
// Tiedostojen tila
// ---------------------------------------------------------------------------

/** @type {Map<string, {content: string, version: number, editor: string}>} */
const docs = new Map();

/** Tiedostojen rivinvaihdot säilytetään ennallaan (CRLF/LF). */
const eols = new Map();

function readNormalized(file) {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  eols.set(file, eol);
  return raw.replace(/\r\n/g, '\n');
}

for (const file of FILES) {
  const content = fs.existsSync(path.join(ROOT, file)) ? readNormalized(file) : '';
  docs.set(file, { content, version: 1, editor: '' });
}

async function writeDoc(file, content, editorName) {
  const normalized = content.replace(/\r\n/g, '\n');
  const eol = eols.get(file) || (process.platform === 'win32' ? '\r\n' : '\n');
  const output = eol === '\r\n' ? normalized.replace(/\n/g, '\r\n') : normalized;
  await fsp.writeFile(path.join(ROOT, file), output, 'utf8');
  const doc = docs.get(file);
  doc.content = normalized;
  doc.version += 1;
  doc.editor = editorName || '';
  return doc.version;
}

// ---------------------------------------------------------------------------
// Selainyhteydet (Server-Sent Events)
// ---------------------------------------------------------------------------

/** @type {Set<{res: http.ServerResponse, clientId: string}>} */
const streams = new Set();

function send(res, payload) {
  try {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch {
    /* yhteyttä ei voi kirjoittaa – siivotaan seuraavassa kierroksessa */
  }
}

function broadcast(payload, exceptClientId) {
  for (const stream of streams) {
    if (exceptClientId && stream.clientId === exceptClientId) continue;
    send(stream.res, payload);
  }
}

function docSnapshot() {
  return FILES.map((file) => {
    const doc = docs.get(file);
    return {
      file,
      content: doc.content,
      version: doc.version,
      editor: doc.editor,
    };
  });
}

// Läsnäolo: kuka on paikalla ja mitä tiedostoa muokkaa.
/** @type {Map<string, {name: string, file: string, lastSeen: number}>} */
const presence = new Map();

function presenceList() {
  const now = Date.now();
  return [...presence.entries()]
    .filter(([, user]) => now - user.lastSeen < PRESENCE_TTL)
    .map(([id, user]) => ({ id, name: user.name, file: user.file }));
}

function broadcastPresence() {
  broadcast({ type: 'presence', users: presenceList() });
}

setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [id, user] of presence) {
    if (now - user.lastSeen >= PRESENCE_TTL) {
      presence.delete(id);
      changed = true;
    }
  }
  if (changed) broadcastPresence();
}, 5000).unref?.();

// ---------------------------------------------------------------------------
// Ulkoiset muutokset (esim. VS Code tai Live Share)
// ---------------------------------------------------------------------------

const watchTimers = new Map();

function checkExternalChange(file) {
  fsp
    .readFile(path.join(ROOT, file), 'utf8')
    .then((raw) => {
      const content = raw.replace(/\r\n/g, '\n');
      const doc = docs.get(file);
      if (content === doc.content) return;
      doc.content = content;
      doc.version += 1;
      doc.editor = 'VS Code';
      broadcast({
        type: 'update',
        file,
        content,
        version: doc.version,
        editor: 'VS Code',
        external: true,
      });
      log(`Ulkoinen muutos: ${file} (v${doc.version})`);
    })
    .catch((error) => log(`Tiedoston luku epäonnistui: ${file} – ${error.message}`));
}

try {
  fs.watch(ROOT, (_event, filename) => {
    if (!filename || !FILES.includes(filename)) return;
    clearTimeout(watchTimers.get(filename));
    watchTimers.set(
      filename,
      setTimeout(() => checkExternalChange(filename), 150),
    );
  });
} catch (error) {
  log(`Tiedostojen seuranta ei käynnistynyt: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Apurit
// ---------------------------------------------------------------------------

function log(message) {
  const time = new Date().toLocaleTimeString('fi-FI');
  console.log(`[${time}] ${message}`);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Pyyntö on liian suuri.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('Virheellinen JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function localAddresses() {
  const addresses = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.family === 'IPv4' && !entry.internal) addresses.push(entry.address);
    }
  }
  return addresses;
}

function openBrowser(url) {
  if (process.env.NO_OPEN === '1') return;
  const command =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(command, { windowsHide: true }, () => {});
}

// ---------------------------------------------------------------------------
// Palvelin
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/api/events') return handleEvents(req, res, url);
  if (pathname === '/api/state') return sendJson(res, 200, { docs: docSnapshot() });
  if (pathname === '/api/save' && req.method === 'POST') return handleSave(req, res);
  if (pathname === '/api/presence' && req.method === 'POST') return handlePresence(req, res);
  if (pathname === '/livereload.js') return serveLiveReload(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Metodi ei ole tuettu.' });
  }

  if (pathname === '/' || pathname === '/editori' || pathname === '/editori/') {
    return serveFile(res, 'editor.html', req.method === 'HEAD');
  }
  if (pathname === '/index.html') {
    return serveFile(res, 'index.html', req.method === 'HEAD', { injectLiveReload: true });
  }
  if (FILES.includes(pathname.slice(1))) {
    return serveFile(res, pathname.slice(1), req.method === 'HEAD');
  }
  if (pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }
  return sendJson(res, 404, { error: 'Ei löytynyt.' });
});

function handleEvents(req, res, url) {
  const clientId = url.searchParams.get('clientId') || '';
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 2000\n\n');
  const stream = { res, clientId };
  streams.add(stream);
  send(res, { type: 'init', docs: docSnapshot(), users: presenceList() });
  log(`Selain yhdistyi (${streams.size} paikalla)`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      /* alla oleva close hoitaa siivouksen */
    }
  }, 25_000);

  const cleanup = () => {
    clearInterval(heartbeat);
    streams.delete(stream);
    log(`Selain poistui (${streams.size} paikalla)`);
  };
  req.on('close', cleanup);
  req.on('error', cleanup);
}

async function handleSave(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const file = String(body.file || '');
  const content = typeof body.content === 'string' ? body.content : null;
  const baseVersion = Number(body.baseVersion);
  const clientId = String(body.clientId || '');
  const name = String(body.name || 'Nimetön').slice(0, 40).trim() || 'Nimetön';

  if (!FILES.includes(file)) return sendJson(res, 400, { error: 'Tuntematon tiedosto.' });
  if (content === null) return sendJson(res, 400, { error: 'Sisältö puuttuu.' });

  const doc = docs.get(file);
  const force = body.force === true;

  // Jos sisältö on jo sama, ei tarvita ristiriitaa tai kirjoitusta.
  if (content === doc.content) {
    return sendJson(res, 200, { ok: true, version: doc.version, unchanged: true });
  }

  if (!force && Number.isFinite(baseVersion) && baseVersion !== doc.version) {
    return sendJson(res, 409, {
      error: 'Tiedostoa on muokattu muualla.',
      conflict: true,
      file,
      content: doc.content,
      version: doc.version,
      editor: doc.editor || 'Toinen käyttäjä',
    });
  }

  try {
    const version = await writeDoc(file, content, name);
    presence.set(clientId, { name, file, lastSeen: Date.now() });
    broadcast({ type: 'update', file, content, version, editor: name, clientId }, clientId);
    broadcastPresence();
    log(`${name} tallensi ${file} (v${version})`);
    return sendJson(res, 200, { ok: true, version });
  } catch (error) {
    log(`Tallennus epäonnistui: ${error.message}`);
    return sendJson(res, 500, { error: 'Tallennus epäonnistui.' });
  }
}

async function handlePresence(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }
  const clientId = String(body.clientId || '');
  if (!clientId) return sendJson(res, 400, { error: 'clientId puuttuu.' });
  const name = String(body.name || 'Nimetön').slice(0, 40).trim() || 'Nimetön';
  const file = FILES.includes(String(body.file)) ? String(body.file) : '';
  presence.set(clientId, { name, file, lastSeen: Date.now() });
  broadcastPresence();
  return sendJson(res, 200, { ok: true });
}

function serveLiveReload(res) {
  const script = `(() => {
  if (window.self !== window.top) return; // editori hoitaa esikatselun itse
  const source = new EventSource('/api/events?clientId=' + encodeURIComponent('livereload-' + Math.random()));
  source.addEventListener('message', (event) => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.type !== 'update') return;
    if (data.file === 'style.css') {
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const url = new URL(link.href, location.href);
        url.searchParams.set('t', Date.now());
        link.href = url.toString();
      });
    } else if (data.file === 'index.html') {
      location.reload();
    }
  });
})();
`;
  res.writeHead(200, {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(script),
  });
  res.end(script);
}

function serveFile(res, file, headOnly = false, options = {}) {
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT + path.sep)) {
    return sendJson(res, 403, { error: 'Kielletty.' });
  }

  fs.readFile(full, (error, buffer) => {
    if (error) return sendJson(res, 404, { error: 'Ei löytynyt.' });
    let body = buffer;
    let type = CONTENT_TYPES[path.extname(full).toLowerCase()] || 'application/octet-stream';

    if (options.injectLiveReload && type.startsWith('text/html')) {
      const html = buffer.toString('utf8');
      const snippet = '<script src="/livereload.js"></script>';
      const injected = html.includes('</body>')
        ? html.replace('</body>', `${snippet}\n</body>`)
        : html + snippet;
      body = Buffer.from(injected, 'utf8');
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
    });
    if (headOnly) return res.end();
    res.end(body);
  });
}

server.listen(PORT, HOST, () => {
  const local = `http://localhost:${PORT}`;
  log('Nettisivun reaaliaikainen editori käynnistyi.');
  log(`Avaa selaimessa: ${local}`);
  for (const address of localAddresses()) {
    log(`Jaettava osoite samassa verkossa: http://${address}:${PORT}`);
  }
  log('Lopeta painamalla Ctrl+C.');
  openBrowser(local);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    log(`Portti ${PORT} on jo käytössä. Kokeile: node server.js --port 4174`);
  } else {
    log(`Palvelinvirhe: ${error.message}`);
  }
  process.exitCode = 1;
});

process.on('SIGINT', () => {
  log('Sammutetaan…');
  for (const stream of streams) {
    try {
      stream.res.end();
    } catch {
      /* ohitetaan */
    }
  }
  server.close(() => process.exit(0));
});
