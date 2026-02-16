import axios from "axios";
import { KeycloakService } from "./KeycloakService";

const baseApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

baseApi.interceptors.request.use((config): any => {
  if (KeycloakService.isLoggedIn()) {
    config.headers.Authorization = `Bearer ${KeycloakService.getToken()}`;
  }
  return config;
});

const getOptions = async () => {
  const response = await baseApi.get('/metadata/options');
  return response.data;
}

const getWorkflows = async () => {
  const response = await baseApi.get('/policies')
  return response.data
}

const getWorkflowStage = async (workflowName: string, stage: 'pre_ingest' | 'ingest') => {
  const response = await baseApi.get(`/policies/${workflowName}/stages/${stage}`)
  return response.data
}

export const APIService = {
  getOptions,
  getWorkflows,
  getWorkflowStage
}