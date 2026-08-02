import api from './api';

export const generateAiRecipe = async (prompt) => {
  const response = await api.post('/ai/generate', { prompt });
  return response.data;
};
