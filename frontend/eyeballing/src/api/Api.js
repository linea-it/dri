import axios from 'axios';

let api = '/dri/api';
if (process.env.NODE_ENV !== 'production') {
  api = process.env.REACT_APP_API;
}

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = api;

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
  loggedUser = async () => {
    const res = await axios.get(`/logged/get_logged/`);
    const user = await res.data;
    return user;
  };

  allReleases = async () => {
    const params = {
      ordering: '-id',
    };
    const res = await axios.get(`/releases/`, {
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

    const res = await axios.get(`/dataset/`, {
      params: params,
    });

    const data = await res.data;
    return data;
  };

  updateInspectValue = (inspectId, value) => {
    return axios.patch(`/inspect/${inspectId}/`, {
      isp_value: value,
    });
  };

  deleteInspect = inspectId => {
    return axios.delete(`/inspect/${inspectId}/`);
  };

  createinspect = (datasetId, value) => {
    return axios.post(`/inspect/`, {
      isp_dataset: datasetId,
      isp_value: value,
    });
  };
}
export default DriApi;

export function logout() {
  window.location.replace(api + '/api-auth/logout/?next=/');
}
