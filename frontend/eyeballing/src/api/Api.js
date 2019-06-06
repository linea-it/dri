import axios from 'axios';

const fake_token = '2c2cf7fb465c8524ea8c1ea2ab214daa240c8f8c';

axios.defaults.headers.common['Authorization'] = 'Token ' + fake_token;

class DriApi {
  static api_url =
    process.env.NODE_ENV === 'production'
      ? window._env_.REACT_APP_API
      : process.env.REACT_APP_API;

  static async loggedUser() {
    const res = await axios.get(`${this.api_url}/logged/`);
    const users = await res.data;

    return users[0];
  }

  static async allReleases() {
    const params = {
      ordering: '-id',
    };
    const res = await axios.get(`${this.api_url}/releases/`, {
      params: params,
    });
    const data = await res.data;
    return data;
  }

  static async datasetsByRelease(releaseId) {
    const params = {
      ordering: 'tli_tilename',
      release: releaseId,
      limit: 5,
    };
    const res = await axios.get(`${this.api_url}/dataset/`, {
      params: params,
    });
    const data = await res.data;
    return data;
  }

  teste() {
    console.log('DriApi: Teste');
  }
}
export default DriApi;
