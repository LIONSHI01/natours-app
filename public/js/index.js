/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
import { logout } from './login';
import { displayMap } from './mapbox.js';
import { updateData } from './updateSetting';
import { updateUserPassword } from './updateSetting';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updateUserPasswordForm = document.querySelector('.form-user-settings');

// DELEGATION (Prevent error when in pages without Map)
if (mapBox) {
  console.log('there is map here!');
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    updateData(name, email);
  });
}

if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    updateUserPassword(passwordCurrent, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
