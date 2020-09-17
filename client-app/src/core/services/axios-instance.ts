import axios from "axios";
import { baseUrl, loginUrl, accessDeniedUrl } from 'core/constants';

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = baseUrl;
axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status) {
      switch(error.response.status){
      case 401:
        window.location.assign(loginUrl);
        break;
      case 403:
        window.location.assign(accessDeniedUrl);
        break;
      }
    }
    return Promise.reject(error)
  });

export default axiosInstance;
