import axios from 'axios';
import { DiscoveredResource, ProviderResourceMapping, CreateMappingPayload } from '../types/integration';

const API_BASE_URL = '/api/v1/providers';
const MAPPINGS_API_URL = '/api/v1/integration/mappings';

export const integrationApi = {
  discoverResources: async (providerConnectionId: string, resourceType: string): Promise<DiscoveredResource[]> => {
    const response = await axios.get(`${API_BASE_URL}/${providerConnectionId}/discover/${resourceType}`);
    return response.data;
  },

  createMapping: async (payload: CreateMappingPayload): Promise<ProviderResourceMapping> => {
    const response = await axios.post(MAPPINGS_API_URL, payload);
    return response.data;
  },

  getMappingsForResource: async (resourceType: string, internalResourceId: string): Promise<ProviderResourceMapping[]> => {
    const response = await axios.get(`${MAPPINGS_API_URL}/resource/${resourceType}/${internalResourceId}`);
    return response.data;
  },
  
  deleteMapping: async (mappingId: string): Promise<void> => {
    await axios.delete(`${MAPPINGS_API_URL}/${mappingId}`);
  }
};
