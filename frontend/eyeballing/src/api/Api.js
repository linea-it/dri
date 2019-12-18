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
  response => (
    // Do something with response data
    response
  ),
  (error) => {
    // Do something with response error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        toLogin();
      }
      if (error.response.status === 403) {
        toLogin();
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

class DriApi {
  loggedUser = async () => {
    const res = await axios.get('/logged/get_logged/');
    const user = await res.data;
    return user;
  };

  allReleases = async () => {
    const params = {
      ordering: '-id',
    };
    const res = await axios.get('/releases/', {
      params,
    });
    const data = await res.data;
    return data;
  };

  datasetsByRelease = async ({
    release, search, filters, limit, offset,
  }) => {
    const params = {
      ordering: 'tile__tli_tilename',
      search,
      release,
      limit,
      offset,
    };

    if (filters && filters.length) {
      filters.forEach((element) => {
        params[element.property] = element.value;
      });
    }

    const res = await axios.get('/dataset/', {
      params,
    });

    const data = await res.data;
    return data;
  };

  updateInspectValue = (inspectId, value) => axios.patch(`/inspect/${inspectId}/`, {
    isp_value: value,
  });

  deleteInspect = inspectId => axios.delete(`/inspect/${inspectId}/`);

  createinspect = (datasetId, value) => axios.post('/inspect/', {
    isp_dataset: datasetId,
    isp_value: value,
  });


  comments = ({
    release, offset, limit, dts_type, sorting, search, filters = [],
  }) => {
    let ordering = sorting[0].columnName;

    if (sorting && sorting[0].direction === 'desc') {
      ordering = `-${sorting[0].columnName}`;
    }
    const params = {
      release, offset, limit, ordering, search, dts_type,
    };

    filters.forEach((element) => {
      params[element.property] = element.value;
    });

    return axios.get('/comment/dataset/', {
      params,
    }).then(res => res.data);
  };

  commentsByDataset = async (datasetId) => {
    const res = await axios.get('/comment/dataset/', {
      params: {
        dts_dataset: datasetId,
        ordering: '-dts_date',
      },
    });

    const data = await res.data;
    return data;
  };

  updateComment = (commentId, comment) => axios.patch(`/comment/dataset/${commentId}/`, {
    dts_comment: comment,
  });

  createDatasetComment = (datasetId, value, dts_type, dts_ra, dts_dec) => axios.post('/comment/dataset/', {
    dts_dataset: datasetId,
    dts_comment: value,
    dts_type,
    dts_ra,
    dts_dec,
  });

  deleteComment = commentId => axios.delete(`/comment/dataset/${commentId}/`);

  getFeatures = () => axios.get('/feature/').then(res => res.data);

  getDatasetCommentsByType = (dts_dataset, type) => axios.get('/comment/dataset/', {
    params: { dts_dataset, dts_type: type },
  }).then(res => res.data);
}
export default DriApi;

export function toLogin() {
  window.location.replace(`${api}/api-auth/login/?next=/eyeballing/`);
}

export function logout() {
  window.location.replace(`${api}/api-auth/logout/?next=/`);
}
