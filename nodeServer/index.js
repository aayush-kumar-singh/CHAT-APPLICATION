// node server which will handle socket io connections
// run: node server.js
const io = require('socket.io')(8000, {
  cors: {
    origin: '*', // permissive for development; restrict in production
    methods: ['GET', 'POST']
  }
});

const users = {};

io.on('connection', socket => {
  // new user joined
  socket.on('new-user-joined', name => {
    console.log("New user", name);
    users[socket.id] = name;
    // broadcast to all except the joining socket
    socket.broadcast.emit('user-joined', name);
  });

  // receiving a message from a client
  socket.on('send', message => {
    // broadcast to all other clients
    socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
  });

  // when somebody disconnects
  socket.on('disconnect', () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit('left', name);
      delete users[socket.id];
    }
  });
});
