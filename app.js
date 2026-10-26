import http from 'node:http';

async function start() {
  try {
    await import('tsx/esm');
    await import('./server.ts');
  } catch (error) {
    const missingTsx =
      error &&
      error.code === 'ERR_MODULE_NOT_FOUND' &&
      String(error.message || '').includes('tsx');

    if (!missingTsx) {
      console.error(error);
      process.exitCode = 1;
      return;
    }

    const port = Number(process.env.PORT) || 3000;
    http
      .createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Nido deployment bootstrap');
      })
      .listen(port, '0.0.0.0');
  }
}

await start();
