import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost/api",
    headers: {
        "Content-Type": "application/json"
    }
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status >= 500) {
        console.log('500')
      }
      return Promise.reject(error);
    }
  );