/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import axios from 'axios';

const host = process.env.REACT_APP_API || `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' : ''
  }${window.location.port}`;

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${host}/dri/api/`;

// Interceptar a Resposta.
// Add a response interceptor
axios.interceptors.response.use(
  (response) => (
    // Do something with response data
    response
  ),
  (error) => {
    // Do something with response error
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Na landinpage o Login é opicional. não é necessário redirecionar para o login.
          break;
        case 403:
          // Na landinpage o Login é opicional. não é necessário redirecionar para o login.
          break;
        case 404:
          to404();
          break;
        default:
          console.log(error.request);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
      // to404();
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(error.message);
      // to404();
    }


    return Promise.reject(error);
  },
);

// eslint-disable-next-line consistent-return
export const getLoggedUser = () => axios.get('logged/get_logged/', { params: { format: 'json' } }).then((result) => {

  var data = result.data;

  // Informa o Id o usuario para o GA, para que possa reconher usuarios unicos.
  window.gtag('config', 'GA_MEASUREMENT_ID', {
    'user_id': data.id
  });

  return data
}).catch((error) => {
  if (error) {
    return { username: undefined };
  }
  if (error.response.status === 403) {
    return { username: undefined };
  }
});

export const tutorials = () => axios.get('tutorial/')
  .then((res) => res.data)
  .catch((err) => {
    console.error(err);
    return err;
  });

export const getApplication = () => axios.get('application/?format=json&ordering=app_order')
  .then((res) => res.data.filter((el) => !el.app_disabled))
  .catch((err) => {
    console.error(err);
    return err;
  });

export const sendEmail = (formData) => axios.post('contact/', formData)
  .then((res) => res)
  .catch((err) => err);

export const signPath = () => axios.get('get_ncsa_signup/')
  .then((res) => res.data)
  .catch((err) => {
    console.error(err);
    return err;
  });

const to404 = () => {
  window.open(`${host}/404`);
};

export const urlLogin = `${host}/dri/api/api-auth/login/?next=/`;

export const urlSign = (path) => {
  return path ? `${host}/dri/api/${path}` : `${host}/oracle-easy-access`;
};

export const urlLogout = `${host}/dri/api/api-auth/logout/?next=/`;
