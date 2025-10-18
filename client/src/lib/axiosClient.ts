import axios from 'axios';
// import { API_URL } from "@app/config/env";
const axiosClient = axios.create({
  baseURL: 'http://localhost:4000/api', // force explicit for debugging
});

export default axiosClient;
