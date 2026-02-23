import api from "./api";
import type { ScanQR } from "../types/scanQr";

// Get all scan records
export const getScans = async (): Promise<ScanQR[]> => {
    const res = await api.get<ScanQR[]>("/scans");
    return res.data;
};

// Get a scan record by ID
export const getScanById = async (id: number): Promise<ScanQR> => {
    const res = await api.get<ScanQR>(`/scans/${id}`);
    return res.data;
};

// Create a new scan record
export const createScan = async (scan: Partial<ScanQR>): Promise<ScanQR> => {
    const res = await api.post<ScanQR>("/scans", scan);
    return res.data;
};

// Update a scan record
export const updateScan = async (id: number, scan: Partial<ScanQR>): Promise<ScanQR> => {
    const res = await api.put<ScanQR>(`/scans/${id}`, scan);
    return res.data;
};

// Delete a scan record
export const deleteScan = async (id: number): Promise<void> => {
    await api.delete(`/scans/${id}`);
};