import axios from 'axios';


const api = axios.create({
    baseURL: 'https://desportal.cosmology.illinois.edu/dri/api/'
});

export default api;