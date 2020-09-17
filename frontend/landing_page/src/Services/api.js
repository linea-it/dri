import axios from 'axios';


const api = axios.create({
    baseURL: 'https://desportal.cosmology.illinois.edu/dri/api/'
});

const baseUrl = 'https://desportal.cosmology.illinois.edu/dri/api/'

export const getApplication = () =>
  axios.all([
    axios.get(`${baseUrl}application/?format=json&ordering=app_order`),
  ])
  .then(axios.spread((res) => res.data.filter(el => !el.app_disabled)))
  .catch((err) => {
    console.error(err);
    return err;
  });

export default api;