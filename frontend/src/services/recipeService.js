import api from './api';

export const getRecipes = async (params = {}) => {
  const response = await api.get('/recipe', { params });
  return response.data;
};

export const getMyRecipes = async () => {
  const response = await api.get('/recipe/my-recipes');
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await api.post('/recipe', recipeData);
  return response.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await api.put(`/recipe/${id}`, recipeData);
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await api.delete(`/recipe/${id}`);
  return response.data;
};
