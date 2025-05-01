import axios from "axios";
import { KeycloakService } from "./KeycloakService";

const baseApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

baseApi.interceptors.request.use((config): any => {
    if (KeycloakService.isLoggedIn()) {
      const cb = () => {
        config.headers.Authorization = `Bearer ${KeycloakService.getToken()}`;
        return Promise.resolve(config);
      };
      cb();
      return config;
    }
});


const getOptions = async() => {
    const response = await baseApi.get('/metadata/options');
    return response.data;
}

const sendFolderName = async(folderName: string) => {
  const response = await baseApi.post('/metadata/folder-process', {
    folderName: folderName,
  });
  return response.data;
}

export const APIService = {
    getOptions,
    sendFolderName
}