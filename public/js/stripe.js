/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51LITmxBZgGpVkrfsw13e7nP307dT9ctZMAJjGgGLpHSmY37qBELpolcA5Cm9sdrC5jiefJOfRHuwnPrii4lcjHG200yYTKL00v'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
