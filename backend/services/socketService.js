let ioInstance;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('Client connected to Socket.IO:', socket.id);

    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('join_ticket_room', (ticketId) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`Socket ${socket.id} joined ticket_${ticketId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from Socket.IO:', socket.id);
    });
  });
};

const getIO = () => {
  return ioInstance;
};

const notifyUser = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('notification', notification);
  }
};

const sendTicketMessage = (ticketId, message) => {
  if (ioInstance) {
    ioInstance.to(`ticket_${ticketId}`).emit('new_message', message);
  }
};

module.exports = { initSocket, getIO, notifyUser, sendTicketMessage };
