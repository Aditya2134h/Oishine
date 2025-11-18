# Oishine
Projek PSAJ Informatika

## Development (Turbopack)

This repository supports a Turbopack-based development workflow for faster HMR and builds.

- Install deps:

```bash
npm install
```

- Start Turbopack dev (Next + standalone Socket.IO server):

```bash
npm run dev:turbo
```

This runs `next dev --turbo` (port 3000) and a standalone Socket.IO server (`socket-server.ts`) on port 4000. The client can be pointed to the socket server using the `NEXT_PUBLIC_SOCKET_URL` environment variable.

Create a `.env` (or use `.env.local`) with the following if you want the client to connect to the standalone server during development:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

If you prefer the previous single-process server (Next + Socket.IO embedded), continue using the legacy dev script:

```bash
npm run dev
```
