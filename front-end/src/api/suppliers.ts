import api from "./api";
import type { Supplier } from "../types/supplier";

export const getSuppliers = async (): Promise<Supplier[]> => {
  const res = await api.get<Supplier[]>("/supplier");
  return res.data;
};

export const getSupplierById = async (id: number): Promise<Supplier> => {
  const res = await api.get<Supplier>(`/supplier/${id}`);
  return res.data;
};

export const createSupplier = async (supplier: Partial<Supplier>): Promise<Supplier> => {
  const res = await api.post<Supplier>("/supplier", supplier);
  return res.data;
};

export const updateSupplier = async (id: number, supplier: Partial<Supplier>): Promise<Supplier> => {
  const res = await api.put<Supplier>(`/supplier/${id}`, supplier);
  return res.data;
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await api.delete(`/supplier/${id}`);
};
