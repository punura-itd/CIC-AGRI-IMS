import api from "./api";
import type { Asset } from "../types/assets";


export const getAssets = async (): Promise<Asset[]> => {
  const res = await api.get<Asset[]>("/assets");
  return res.data;
};

export const getAssetById = async (id: number): Promise<Asset> => {
  const res = await api.get<Asset>(`/assets/${id}`);
  return res.data;
};

export const createAsset = async (asset: Partial<Asset>): Promise<Asset> => {
  const res = await api.post<Asset>("/assets", asset);
  return res.data;
};

export const updateAsset = async (id: number, asset: Partial<Asset>): Promise<Asset> => {
  const res = await api.put<Asset>(`/assets/${id}`, asset);
  return res.data;
};

export const deleteAsset = async (id: number): Promise<void> => {
  await api.delete(`/assets/${id}`);
};

export const getAssetByCode = async (assetCode: string): Promise<Asset | null> => {
  try {
    const res = await api.get<Asset>(`/assets/code/${assetCode}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching asset by code:', error);
    return null;
  }
};

