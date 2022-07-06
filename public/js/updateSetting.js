/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// export const updateData = async (name, email) => {
//   try {
//     const result = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:8000/api/v1/users/updateMe',
//       data: {
//         name,
//         email,
//       },
//     });
//     if (result.data.status === 'success') {
//       showAlert('success', 'User info updated successfully!');
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };

export const updateUserPassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updateMyPassword',
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
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

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