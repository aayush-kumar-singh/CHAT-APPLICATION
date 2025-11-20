// connect to server
const socket = io('http://localhost:8000');

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
// container has class "container" — use querySelector
const messageContainer = document.querySelector('.container');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

const audio = new Audio('ting.mp3');

const append = (message, position) => {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message', position);
  messageContainer.append(messageElement);

  // ✅ Suggestion 1: Auto-scroll to latest message
  messageContainer.scrollTop = messageContainer.scrollHeight;

  if (position === 'left') {
    // play sound for incoming messages
    audio.play().catch(() => {/* ignore autoplay policy errors */});
  }
};

// ✅ Suggestion 4: Connection status handling
if (statusDot && statusText) {
  // initial state
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

// form submit: send message
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  append(`You: ${message}`, 'right'); // use backticks for interpolation
  socket.emit('send', message);
  messageInput.value = '';
});

// ✅ Suggestion 3: Better name handling + set document title
const rawName = prompt('Enter your name to join');
let name = rawName ? rawName.trim() : '';

if (!name) {
  // fallback to a guest name if user cancels or leaves it empty
  name = `Guest${Math.floor(Math.random() * 900) + 100}`;
}

socket.emit('new-user-joined', name);
document.title = `HiChat | ${name}`;

// events from server

// ✅ Suggestion 2: Use "system" position for join/left messages
socket.on('user-joined', (name) => {
  append(`${name} joined the chat`, 'system');
});

socket.on('receive', (data) => {
  append(`${data.name}: ${data.message}`, 'left');
});

socket.on('left', (name) => {
  append(`${name} left the chat`, 'system');
});
