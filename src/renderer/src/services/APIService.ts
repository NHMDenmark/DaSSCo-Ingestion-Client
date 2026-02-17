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

const getWorkflowStage = async (workflowName: string, workflowVersion: number, stage: 'pre_ingest' | 'ingest') => {
  const response = await baseApi.get(`/policies/${workflowName}/${workflowVersion}/stages/${stage}`)
  return response.data
}

const createPreIngestSession = async (
  workflowName: string, 
  workflowVersion: number,
  workstation: string
) => {
  const response = await baseApi.post('/preingest/sessions', {
    policyName: workflowName,
    policyVersion: workflowVersion,
    workstation: workstation
  })
  return response.data.sessionId
}

const addSessionData = async (sessionId: string, key: string, value: any) => {
  const response = await baseApi.post(`/preingest/sessions/${sessionId}/data`, {
    key: key,
    value: value
  })
  return response
}

const startPreIngest = async (sessionId: string) => {
  const response = await baseApi.post(`/preingest/run`, {
    sessionId: sessionId
  })
  return response.data
}

export const APIService = {
  getOptions,
  getWorkflows,
  getWorkflowStage,
  startPreIngest,
  addSessionData,
  createPreIngestSession
}