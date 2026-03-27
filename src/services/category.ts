import { categoryApi } from '../services';
import { handleUnauthorized } from '../utils/handleUnauthorized';
import type { CategoryResponse } from '../api';



export const getCategoriesAPI = async () => {
  return await categoryApi.getAllCategories();
};

export const createCategoryAPI = async (name: string) => {
  const normalizedName =
    name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
  try {
    const response = await categoryApi.createCategory({
      categoryRequest: { name: normalizedName },
    });
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
};

export const checkCategoryExistsAPI = async (name: string): Promise<boolean> => {
  try {
    const categories = await categoryApi.getAllCategories();
    return categories.some(
      (cat: CategoryResponse) => cat.name?.toLowerCase() === name.toLowerCase()
    );
  } catch (error: any) {
    if (error.status === 401) {
      await handleUnauthorized();
    }
    return false;
  }
};