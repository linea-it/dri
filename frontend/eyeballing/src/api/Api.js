import axios from 'axios';

const fake_token = '2c2cf7fb465c8524ea8c1ea2ab214daa240c8f8c';
axios.defaults.headers.common['Authorization'] = 'Token ' + fake_token;

// Interceptar a Resposta.
// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response;
  },
  function (error) {
    // Do something with response error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
      if (error.response.status === 401) {
        logout();
      }
      if (error.response.status === 403) {
        logout();
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
  }
);

class DriApi {
  constructor() {
    this.api_url = '/dri/api';
    if (process.env.NODE_ENV !== 'production') {
      this.api_url = process.env.REACT_APP_API;
    }
  }

  loggedUser = async () => {
    const res = await axios.get(`${this.api_url}/logged/`);
    const users = await res.data;

    return users[0];
  };

  allReleases = async () => {
    const params = {
      ordering: '-id',
    };
    const res = await axios.get(`${this.api_url}/releases/`, {
      params: params,
    });
    const data = await res.data;
    return data;
  };

  datasetsByRelease = async releaseId => {
    const params = {
      ordering: 'tli_tilename',
      release: releaseId,
    };
    // limit: 5,
    const res = await axios.get(`${this.api_url}/dataset/`, {
      params: params,
    });

    const data = await res.data;
    return data;
  };

  updateInspectValue = (inspectId, value) => {
    return axios.patch(`${this.api_url}/inspect/${inspectId}/`, {
      isp_value: value,
    });
  };

  deleteInspect = inspectId => {
    return axios.delete(`${this.api_url}/inspect/${inspectId}/`);
  };

  createinspect = (datasetId, value) => {
    return axios.post(`${this.api_url}/inspect/`, {
      isp_dataset: datasetId,
      isp_value: value,
    });
  };
}
export default DriApi;

// Authenticacao

let api = '/dri/api';
if (process.env.NODE_ENV !== 'production') {
  api = process.env.REACT_APP_API;
}

export function isAuthenticated() {
  // return !!localStorage.token;
  if (localStorage.token) {
    axios.defaults.headers.common['Authorization'] =
      'Token ' + localStorage.token;
    return true;
  } else {
    return false;
  }
}

export function login(username, password, cb) {
  if (localStorage.token) {
    if (cb) cb(true);
    return;
  }
  getToken(username, password, res => {
    if (res.authenticated) {
      localStorage.token = res.token;
      axios.defaults.headers.common['Authorization'] = 'Token ' + res.token;
      if (cb) cb(true);
    } else {
      if (cb) cb(false);
    }
  });
}

export function logout() {
  console.log('logout()');
  delete localStorage.token;
  window.location.replace(api + '/api-auth/login/?next=/eyeballing/');
}

export function getToken(username, password, cb) {
  axios
    .post(`${api}/obtain-auth-token/`, {
      username: username,
      password: password,
    })
    .then(res => {
      var result = res.data;
      cb({
        authenticated: true,
        token: result.token,
      });
    })
    .catch(error => {
      const data = error.response.data;
      if ('non_field_errors' in data) {
        alert(data.non_field_errors[0]);
      }
    });
}
