// connect to server (same origin: works locally + on Render)
const socket = io();

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

const audio = new Audio('ting.mp3');

// Helper: append message to chat
const append = (message, position) => {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message', position);
  messageContainer.append(messageElement);

  // Auto-scroll to latest message
  messageContainer.scrollTop = messageContainer.scrollHeight;

  if (position === 'left') {
    // Play sound for incoming messages only
    audio.play().catch(() => {
      // ignore autoplay errors
    });
  }
};

// Connection status UI
if (statusDot && statusText) {
  statusText.textContent = 'Connecting...';
}

socket.on('connect', () => {
  if (statusText) statusText.textContent = 'Online';
  if (statusDot) {
    statusDot.style.background = '#00cec9';
    statusDot.style.boxShadow = '0 0 10px rgba(0, 206, 201, 0.9)';
  }
});

socket.on('disconnect', () => {
  if (statusText) statusText.textContent = 'Offline';
  if (statusDot) {
    statusDot.style.background = '#e17055';
    statusDot.style.boxShadow = '0 0 10px rgba(225, 112, 85, 0.9)';
  }
});

// 🔹 NAME PROMPT (this is what you were using before)

const rawName = prompt('Enter your name to join');
let name = rawName ? rawName.trim() : '';

if (!name) {
  // fallback guest name if user cancels or leaves blank
  name = `Guest${Math.floor(Math.random() * 900) + 100}`;
}

socket.emit('new-user-joined', name);
document.title = `HiChat | ${name}`;

// Handle form submit (send message)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  append(`You: ${message}`, 'right');
  socket.emit('send', message);
  messageInput.value = '';
});

// Events from server
socket.on('user-joined', (name) => {
  append(`${name} joined the chat`, 'system');
});

socket.on('receive', (data) => {
  append(`${data.name}: ${data.message}`, 'left');
});

socket.on('left', (name) => {
  append(`${name} left the chat`, 'system');
});
