/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/'), 1500;
      });
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    // KEYNOTE: reload page after logout
    if (result.data.status === 'success') location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
