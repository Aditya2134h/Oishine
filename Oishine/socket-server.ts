import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupSocket } from './src/lib/socket'

const port = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 4000
const hostname = '0.0.0.0'

const server = createServer()

const io = new Server(server, {
  path: '/api/socketio',
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  }
})

setupSocket(io)

server.listen(port, hostname, () => {
  console.log(`Socket.IO server running at ws://${hostname}:${port}/api/socketio`)
})
