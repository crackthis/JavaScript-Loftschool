'use strict';
import './css/style.css';
import WSClient from './wsclient';
import UserList from './js/userList';
import UserPhoto from './js/userPhoto';
import { sanitize } from './utils';
import 'regenerator-runtime/runtime';

const loginButton = document.querySelector('[data-role=login-submit]');
const loginInput = document.querySelector('[data-role=login-name-input]');
const loginError = document.querySelector('[data-role=login-error]');
const loginScreen = document.querySelector('#login');
const chatScreen = document.querySelector('#main');

//SERVER CONST
const wsclient = new WSClient(`ws://localhost:8080`, onMessage);
const userName = document.querySelector('[data-role=user-name]');
const userList = new UserList(document.querySelector('[data-role=user-list]'));
const messageList = document.querySelector('[data-role=messages-list]');
const messageSendButton = document.querySelector('[data-role=message-send-button]');
const messageInput = document.querySelector('[data-role=message-input]');
const userPhoto = new UserPhoto(
  document.querySelector('[data-role=user-photo]'),
  onUpload
);

hide(chatScreen);

function show(elem) {
  elem.classList.remove('hidden');
}

function hide(elem) {
  elem.classList.add('hidden');
}

function setUsername(elem, name) {
  elem.textContent = name;
}

function addSystemMessage(message) {
  const item = document.createElement('div');
  item.classList.add('message-item', 'message-item-system');
  item.textContent = message;

  messageList.append(item);
  messageList.scrollTop = messageList.scrollHeight;
}

function onUpload(data) {
  userPhoto.set(data);
  fetch('http://localhost:8080/src/upload-photo', {
    method: 'post',
    body: JSON.stringify({
      name: userName.value,
      image: data,
    }),
  });
}

async function onLogin(name) {
  await wsclient.connect();
  wsclient.sendHello(name);
  hide(loginScreen);
  show(chatScreen);
  setUsername(userName, name);
  userPhoto.set(`http://localhost:8080/src/photos/${name}.png?t=${Date.now()}`);
}

function onSend(message) {
  wsclient.sendTextMessage(message);
  messageInput.value = '';
}

function add(from, text, messageList) {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, 0);
  const minutes = String(date.getMinutes()).padStart(2, 0);
  const time = `${hours}:${minutes}`;
  const item = document.createElement('div');

  item.classList.add('message-item');
  item.innerHTML = `
    <div class="message-item-left">
        <div style="background-image: url(src/photos/${from}.png?t=${Date.now()})" 
        class="message-item-photo" data-role="user-avatar" data-user=${sanitize(
          from
        )}></div>
    </div>
    <div class="message-item-right">
      <div class="message-item-header">
          <div class="message-item-header-name">${sanitize(from)}</div>
          <div class="message-item-header-time">${time}</div>
      </div>
      <div class="message-item-text">${sanitize(text)}</div>
    </div>
    `;

  messageList.append(item);
  messageList.scrollTop = messageList.scrollHeight;
}

messageSendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    onSend(message);
  }
});

messageInput.addEventListener('keyup', (e) => {
  const message = messageInput.value.trim();
  if (e.keyCode === 13) {
    onSend(message);
  }
});

function onMessage({ type, from, data }) {
  console.log(type, from, data);

  if (type === 'hello') {
    userList.add(from);
    addSystemMessage(`${from} вошёл в чат`);
  } else if (type === 'user-list') {
    for (const item of data) {
      userList.add(item);
    }
  } else if (type === 'bye-bye') {
    userList.remove(from);
    addSystemMessage(`${from} вышел из чата`);
  } else if (type === 'text-message') {
    add(from, data.message, messageList);
  } else if (type === 'photo-changed') {
    const avatars = document.querySelectorAll(
      `[data-role=user-avatar][data-user=${data.name}]`
    );

    for (const avatar of avatars) {
      avatar.style.backgroundImage = `url(/src/photos/${data.name}.png?t=${Date.now()})`;
    }
  }
}

loginButton.addEventListener('click', () => {
  loginError.textContent = '';
  const name = loginInput.value;
  if (!name) {
    loginError.textContent = 'Введите логин';
  } else {
    onLogin(loginInput.value);
  }
});
