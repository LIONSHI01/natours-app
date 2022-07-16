/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserPassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMyPassword',
      data: { passwordCurrent, password, passwordConfirm },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Password updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// ALTERNATIVE METHOD
export const updateSetting = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
