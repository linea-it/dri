import axios from 'axios';

export const getApplication = () =>
  axios.all([
    axios.get(`/application/?format=json&ordering=app_order`),
  ])
  .then(axios.spread((res) => res.data.filter(el => !el.app_disabled)))
  .catch((err) => {
    console.error(err);
    return err;
  });
