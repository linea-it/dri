/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import axios from 'axios';

const host = process.env.REACT_APP_API || `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? ':' : ''
}${window.location.port}`;

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${host}/dri/api/`;
// axios.defaults.baseURL = `http://dri-testing.linea.gov.br/dri/api/`;

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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (!error.response.status === 403) {
        // if (error.response.status === 401) {
        // eslint-disable-next-line no-use-before-define
        toLogin();
        // } else {
        //   toLogin();
        // }
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
    return Promise.reject(error);
  },
);

// eslint-disable-next-line consistent-return
export const getLoggedUser = () => axios.get('logged/get_logged/', { params: { format: 'json' } }).then((result) => result.data).catch((error) => {
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
  .catch((err) => {
    console.error(err);
    return err;
  });


const toLogin = () => {
  window.open(`${host}/404`);
};

export const urlLogin = `${host}/dri/api/api-auth/login/?next=/`;

export const urlLogout = `${host}/dri/api/api-auth/logout/?next=/`;