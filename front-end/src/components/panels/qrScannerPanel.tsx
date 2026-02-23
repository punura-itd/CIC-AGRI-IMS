import React, { useRef, useEffect, useState } from 'react';
import { Camera, Barcode, X, Copy, ExternalLink, AlertCircle, RefreshCw, MapPin, Download, BarChart3, Filter, FileSpreadsheet, Edit3, Save, CheckCircle, Package } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { getAssetByCode } from '../../api/assets';
import { createScan } from '../../api/scans';
import type { Asset } from '../../types/Asset';
import { useAuth } from '../../context/authContext';

interface ScanResult {
  data: string;
  timestamp: Date;
  id: string;
  location: string;
  deviceInfo?: DeviceInfo;
  assetInfo?: any;
}

interface DeviceInfo {
  type: string;
  model?: string;
  serial?: string;
  status?: string;
}

interface LocationStats {
  location: string;
  count: number;
  devices: DeviceInfo[];
  lastScan: Date;
}

interface EditScanData {
  qrData: string;
  location: string;
  deviceType: string;
  deviceModel: string;
  deviceSerial: string;
  deviceStatus: string;
  notes: string;
}

const QRScannerPanel: React.FC = () => {
  const { hasPermission , user } = useAuth();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string>('');
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [savedLocations, setSavedLocations] = useState<string[]>(['Office Floor 1', 'Office Floor 2', 'Warehouse', 'Conference Room A']);
  const [showReports, setShowReports] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanResult | null>(null);
  const [editScanData, setEditScanData] = useState<EditScanData>({
    qrData: '',
    location: '',
    deviceType: '',
    deviceModel: '',
    deviceSerial: '',
    deviceStatus: 'Active',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    checkCameraSupport();
    loadSavedData();
    
    return () => {
      stopScanning();
    };
  }, []);

  const loadSavedData = () => {
    const savedResults = localStorage.getItem('qrcode-scan-results');
    const savedLocationsList = localStorage.getItem('qrcode-locations');

    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults).map((result: any) => ({
          ...result,
          timestamp: new Date(result.timestamp)
        }));
        setScanResults(parsed);
      } catch (e) {
        console.error('Failed to load saved results');
      }
    }

    if (savedLocationsList) {
      try {
        setSavedLocations(JSON.parse(savedLocationsList));
      } catch (e) {
        console.error('Failed to load saved locations');
      }
    }
  };

  const saveData = async (results: ScanResult[]) => {
    setScanResults(results);
    localStorage.setItem('qrcode-scan-results', JSON.stringify(results));
  };

  const checkCameraSupport = async () => {
    try {
      setError('');
      // Check if camera is available using MediaDevices API
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');
      setHasCamera(hasVideoInput);
      if (!hasVideoInput) {
        setError('No camera found on this device. Please connect a camera and refresh.');
      }
    } catch (err: any) {
      console.error('Camera check error:', err);
      setHasCamera(false);
      if (err?.message?.includes('permission')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setError('Unable to check camera availability. Please ensure your camera is connected and try again.');
      }
    }
  };

  const parseDeviceInfo = (qrData: string): DeviceInfo | undefined => {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type || parsed.model || parsed.serial) {
        return {
          type: parsed.type || 'Unknown Device',
          model: parsed.model,
          serial: parsed.serial,
          status: parsed.status || 'Active'
        };
      }
    } catch (e) {
      const patterns = {
        serial: /(?:SN|Serial|S\/N):?\s*([A-Z0-9-]+)/i,
        model: /(?:Model|MOD):?\s*([A-Z0-9-\s]+)/i,
        type: /(?:Type|Device):?\s*([A-Z0-9-\s]+)/i
      };

      const deviceInfo: Partial<DeviceInfo> = {};

      Object.entries(patterns).forEach(([key, pattern]) => {
        const match = qrData.match(pattern);
        if (match) {
          (deviceInfo as any)[key] = match[1].trim();
        }
      });

      if (Object.keys(deviceInfo).length > 0) {
        return {
          type: deviceInfo.type || 'Device',
          model: deviceInfo.model,
          serial: deviceInfo.serial,
          status: 'Active'
        };
      }
    }

    if (/^[A-Z0-9-]{6,}$/i.test(qrData) || qrData.includes('device') || qrData.includes('equipment')) {
      return {
        type: 'Device',
        serial: qrData,
        status: 'Active'
      };
    }

    return undefined;
  };

  const openEditModal = (scanResult: ScanResult) => {
    setEditingScan(scanResult);
    setEditScanData({
      qrData: scanResult.data,
      location: scanResult.location,
      deviceType: scanResult.deviceInfo?.type || '',
      deviceModel: scanResult.deviceInfo?.model || '',
      deviceSerial: scanResult.deviceInfo?.serial || '',
      deviceStatus: scanResult.deviceInfo?.status || 'Active',
      notes: ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingScan(null);
    setSaveSuccess(false);
  };

  const handleScanComplete = async (decodedText: string) => {
    stopScanning();

    let assetCode = '';
    let assetInfo: Asset | null = null;

    try {
      const qrData = decodedText;

      try {
        const parsed = JSON.parse(qrData);
        assetCode = parsed.assetCode || parsed.asset_code || '';
      } catch {
        // For QR codes, the data is typically just the asset code
        const match = qrData.match(/[A-Z0-9]{3,}/i);
        assetCode = match ? match[0] : qrData;
      }

      if (assetCode) {
        assetInfo = await getAssetByCode(assetCode);

        if (assetInfo) {
        }
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
    }

    const deviceInfo = parseDeviceInfo(decodedText);
    const newResult: ScanResult = {
      data: decodedText,
      timestamp: new Date(),
      id: Date.now().toString(),
      location: currentLocation,
      deviceInfo,
      assetInfo: assetInfo || undefined
    };

    openEditModal(newResult);
  };

  const startScanning = async () => {
    if (!scannerRef.current) {
      setError('Scanner element not available');
      return;
    }

    if (!hasCamera) {
      setError('No camera found on this device');
      return;
    }

    if (!currentLocation.trim()) {
      setError('Please select or enter a location before scanning');
      return;
    }

    try {
      setError('');
      setIsScanning(true);

      // Stop any existing scanner instance
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
        } catch (e) {
          console.warn('Error cleaning up previous scanner:', e);
        }
        html5QrCodeRef.current = null;
      }

      // Create new scanner instance
      const html5QrCode = new Html5Qrcode('qrcode-scanner');
      html5QrCodeRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        throw new Error('No cameras found');
      }

      // Prefer back camera on mobile, otherwise use first available
      const cameraId = devices.find(d => d.label.toLowerCase().includes('back'))?.id || devices[0].id;

      await html5QrCode.start(
  cameraId,
  {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  },
  (decodedText) => {
    handleScanComplete(decodedText);
  },
  (_errorMessage) => {
    // Ignore scanning errors
  }
);

    } catch (err: any) {
      console.error('QR Code Scanner error:', err);
      let errorMessage = 'Failed to start camera. ';
      
      if (err?.message) {
        errorMessage += err.message;
      } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        errorMessage += 'Camera permissions denied. Please allow camera access in your browser settings.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found. Please connect a camera device.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
      
      // Clean up on error
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        html5QrCodeRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const saveScanData = async () => {
    if (!editingScan) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedScan: ScanResult = {
        ...editingScan,
        data: editScanData.qrData,
        location: editScanData.location,
        deviceInfo: editScanData.deviceType ? {
          type: editScanData.deviceType,
          model: editScanData.deviceModel || undefined,
          serial: editScanData.deviceSerial || undefined,
          status: editScanData.deviceStatus
        } : undefined
      };

      const existingIndex = scanResults.findIndex(r => r.id === editingScan.id);
      let updatedResults;

      if (existingIndex >= 0) {
        updatedResults = [...scanResults];
        updatedResults[existingIndex] = updatedScan;
      } else {
        updatedResults = [updatedScan, ...scanResults];
      }
      await createScan({
        assetId: updatedScan.assetInfo ? updatedScan.assetInfo.id : undefined,
        scanDate: updatedScan.timestamp,
        scanLocation: updatedScan.location,
        userId: user?.id, 
      });
      await saveData(updatedResults);

      setSaveSuccess(true);

      setTimeout(() => {
        closeEditModal();
        if (currentLocation.trim() && hasCamera) {
          setTimeout(() => {
            startScanning();
          }, 500);
        }
      }, 1500);

    } catch (error) {
      console.error('Failed to save scan data:', error);
      setError('Failed to save scan data');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewLocation = (location: string) => {
    if (location.trim() && !savedLocations.includes(location.trim())) {
      const updatedLocations = [...savedLocations, location.trim()];
      setSavedLocations(updatedLocations);
      localStorage.setItem('qrcode-locations', JSON.stringify(updatedLocations));
    }
    setCurrentLocation(location.trim());
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const openLink = (url: string) => {
    if (isValidUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const clearResults = () => {
    setScanResults([]);
    localStorage.removeItem('qrcode-scan-results');
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const getLocationStats = (): LocationStats[] => {
    const stats = new Map<string, LocationStats>();

    scanResults.forEach(result => {
      if (!stats.has(result.location)) {
        stats.set(result.location, {
          location: result.location,
          count: 0,
          devices: [],
          lastScan: result.timestamp
        });
      }

      const stat = stats.get(result.location)!;
      stat.count++;

      if (result.deviceInfo && !stat.devices.some(d => d.serial === result.deviceInfo!.serial)) {
        stat.devices.push(result.deviceInfo);
      }

      if (result.timestamp > stat.lastScan) {
        stat.lastScan = result.timestamp;
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  };

  const exportReport = () => {
    const locationStats = getLocationStats();
    const report = {
      generatedAt: new Date().toISOString(),
      totalScans: scanResults.length,
      locations: locationStats,
      detailedResults: scanResults
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-scan-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['QR Code Scanner Report Summary'],
      ['Generated At', new Date().toLocaleString()],
      ['Total Scans', scanResults.length],
      ['Total Locations', getLocationStats().length],
      ['Total Devices Detected', scanResults.filter(r => r.deviceInfo).length],
      [],
      ['Location Statistics'],
      ['Location', 'Total Scans', 'Devices Found', 'Last Scan']
    ];

    getLocationStats().forEach(stat => {
      summaryData.push([
        stat.location,
        stat.count,
        stat.devices.length,
        stat.lastScan.toLocaleString()
      ]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const detailedData = [
      ['Timestamp', 'Location', 'QR Code Data', 'Device Type', 'Device Model', 'Device Serial', 'Device Status', 'Is URL']
    ];

    scanResults.forEach(result => {
      detailedData.push([
        result.timestamp.toLocaleString(),
        result.location,
        result.data,
        result.deviceInfo?.type || '',
        result.deviceInfo?.model || '',
        result.deviceInfo?.serial || '',
        result.deviceInfo?.status || '',
        isValidUrl(result.data) ? 'Yes' : 'No'
      ]);
    });

    const detailedWs = XLSX.utils.aoa_to_sheet(detailedData);
    detailedWs['!cols'] = [
      { width: 20 },
      { width: 15 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 12 },
      { width: 8 }
    ];

    XLSX.utils.book_append_sheet(wb, detailedWs, 'Detailed Scans');

    const deviceScans = scanResults.filter(r => r.deviceInfo);
    if (deviceScans.length > 0) {
      const deviceData = [
        ['Device Type', 'Model', 'Serial Number', 'Status', 'Location', 'Last Scanned', 'QR Code Data']
      ];

      deviceScans.forEach(result => {
        deviceData.push([
          result.deviceInfo!.type,
          result.deviceInfo!.model || '',
          result.deviceInfo!.serial || '',
          result.deviceInfo!.status || '',
          result.location,
          result.timestamp.toLocaleString(),
          result.data
        ]);
      });

      const deviceWs = XLSX.utils.aoa_to_sheet(deviceData);
      deviceWs['!cols'] = [
        { width: 15 },
        { width: 15 },
        { width: 20 },
        { width: 12 },
        { width: 15 },
        { width: 20 },
        { width: 30 }
      ];

      XLSX.utils.book_append_sheet(wb, deviceWs, 'Devices Only');
    }

    const locationData = [['Location', 'Scan Count', 'Device Count', 'Last Scan', 'Device Details']];

    getLocationStats().forEach(stat => {
      const deviceDetails = stat.devices.map(d =>
        `${d.type}${d.model ? ` (${d.model})` : ''}${d.serial ? ` - ${d.serial}` : ''}`
      ).join('; ');

      locationData.push([
        stat.location,
        stat.count.toString(),
        stat.devices.length.toString(),
        stat.lastScan.toLocaleString(),
        deviceDetails
      ]);
    });

    const locationWs = XLSX.utils.aoa_to_sheet(locationData);
    locationWs['!cols'] = [
      { width: 20 },
      { width: 12 },
      { width: 12 },
      { width: 20 },
      { width: 50 }
    ];

    XLSX.utils.book_append_sheet(wb, locationWs, 'Location Breakdown');

    const filename = `QRCode_Scanner_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const filteredResults = filterLocation === 'all'
    ? scanResults
    : scanResults.filter(result => result.location === filterLocation);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <Barcode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">QR Code Scanner</h2>
            <p className="text-xs sm:text-sm text-slate-600">Scan QR codes and track devices</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowReports(!showReports)}
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{showReports ? 'Hide' : 'Show'} Reports</span>
            <span className="sm:hidden">Reports</span>
          </button>
          {scanResults.length > 0 && (
            <>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export JSON</span>
                <span className="sm:hidden">JSON</span>
              </button>
              <button
                onClick={clearResults}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                    <Barcode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                      {editingScan && scanResults.find(r => r.id === editingScan.id) ? 'Edit Scan' : 'New Scan'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 truncate">Review and edit information</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm text-green-800 font-medium">Scan saved successfully!</span>
                </div>
              )}

              {editingScan?.assetInfo && (
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-blue-800">Asset Recognized</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Name:</span>
                      <p className="text-blue-800 break-words">{editingScan.assetInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Category:</span>
                      <p className="text-blue-800">{editingScan.assetInfo.category}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Status:</span>
                      <p className="text-blue-800">{editingScan.assetInfo.status}</p>
                    </div>
                    {editingScan.assetInfo.serialNumber && (
                      <div>
                        <span className="text-blue-600 font-medium">Serial:</span>
                        <p className="text-blue-800 break-words">{editingScan.assetInfo.serialNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">QR Code Data</label>
                <textarea
                  value={editScanData.qrData}
                  onChange={(e) => setEditScanData(prev => ({ ...prev, qrData: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Raw QR code data..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <select
                  value={editScanData.location}
                  onChange={(e) => setEditScanData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select location...</option>
                  {savedLocations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Device Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Device Type</label>
                    <input
                      type="text"
                      value={editScanData.deviceType}
                      onChange={(e) => setEditScanData(prev => ({ ...prev, deviceType: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., Laptop, Printer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Device Model</label>
                    <input
                      type="text"
                      value={editScanData.deviceModel}
                      onChange={(e) => setEditScanData(prev => ({ ...prev, deviceModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., Dell Latitude 5520"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={editScanData.deviceSerial}
                      onChange={(e) => setEditScanData(prev => ({ ...prev, deviceSerial: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., ABC123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                    <select
                      value={editScanData.deviceStatus}
                      onChange={(e) => setEditScanData(prev => ({ ...prev, deviceStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={editScanData.notes}
                  onChange={(e) => setEditScanData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              {editingScan && (
                <div className="text-xs text-slate-500 border-t border-slate-200 pt-3">
                  Scanned at: {formatTimestamp(editingScan.timestamp)}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveScanData}
                  disabled={isSaving || !editScanData.qrData.trim() || !editScanData.location.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      {showReports && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Scanning Reports</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{scanResults.length}</div>
              <div className="text-xs sm:text-sm text-blue-600">Total Scans</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{getLocationStats().length}</div>
              <div className="text-xs sm:text-sm text-green-600">Locations</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-slate-600">
                {scanResults.filter(r => r.deviceInfo).length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600">Devices Detected</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-medium text-slate-700">Location Statistics</h4>
            <div className="space-y-2">
              {getLocationStats().map((stat, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{stat.location}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 ml-6 sm:ml-0">
                    <span>{stat.count} scans</span>
                    <span>{stat.devices.length} devices</span>
                    <span className="hidden sm:inline">Last: {formatTimestamp(stat.lastScan)}</span>
                    <span className="sm:hidden">{new Date(stat.lastScan).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Scanner Section */}
        <div className="space-y-4">
          {/* Location Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <h3 className="text-sm sm:text-base font-medium text-slate-800">Scanning Location</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                  Select or enter location
                </label>
                <select
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select location...</option>
                  {savedLocations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Or enter new location"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentLocation.trim()) {
                      addNewLocation(currentLocation);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {!currentLocation && (
                <p className="text-xs sm:text-sm text-amber-600">⚠️ Location required to start scanning</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-medium text-slate-800">Camera Scanner</h3>
            </div>

            <div className="p-4">
              <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                <div id="qrcode-scanner" ref={scannerRef} className="w-full h-full" />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
                    <div className="text-center text-white px-4">
                      <Camera className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm opacity-75">Camera preview</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-red-800">Error</p>
                    <p className="text-xs sm:text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    disabled={!hasCamera || !currentLocation.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Stop
                  </button>
                )}
                <button
                  onClick={checkCameraSupport}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Refresh camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 text-center">
                <span className={`inline-flex items-center gap-1 text-xs sm:text-sm ${
                  isScanning ? 'text-green-600' : 'text-slate-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isScanning ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {isScanning ? `Scanning at ${currentLocation}...` : 'Scanner stopped'}
                </span>
                {isScanning && (
                  <p className="text-xs text-slate-500 mt-1">
                    Stops after each scan, restarts after saving
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-sm sm:text-base font-medium text-slate-800">
                  Scan Results ({filteredResults.length})
                </h3>
                {scanResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="text-xs sm:text-sm border border-slate-300 rounded px-2 py-1"
                    >
                      <option value="all">All Locations</option>
                      {Array.from(new Set(scanResults.map(r => r.location))).map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              {filteredResults.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Barcode className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-xs sm:text-sm">No QR codes scanned yet</p>
                  <p className="text-xs mt-1">Start scanning to see results</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-mono text-slate-800 break-all">
                            {result.data.length > 50 ? `${result.data.substring(0, 50)}...` : result.data}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {new Date(result.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              📍 {result.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {hasPermission('edit_qr_data') && (
                            <button
                              onClick={() => openEditModal(result)}
                              className="p-1 hover:bg-slate-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                            </button>
                          )}
                          <button
                            onClick={() => copyToClipboard(result.data, result.id)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Copy"
                          >
                            {copiedId === result.id ? (
                              <span className="text-xs text-green-600 font-medium">✓</span>
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                          {isValidUrl(result.data) && (
                            <button
                              onClick={() => openLink(result.data)}
                              className="p-1 hover:bg-slate-200 rounded transition-colors"
                              title="Open"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {result.assetInfo && (
                        <div className="mt-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm">
                          <div className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            Asset Found
                          </div>
                          <div className="space-y-1 text-green-700">
                            <div><span className="font-medium">Name:</span> {result.assetInfo.name}</div>
                            <div><span className="font-medium">Category:</span> {result.assetInfo.category}</div>
                            <div><span className="font-medium">Status:</span> {result.assetInfo.status}</div>
                            {result.assetInfo.location && (
                              <div><span className="font-medium">Location:</span> {result.assetInfo.location}</div>
                            )}
                            {result.assetInfo.serialNumber && (
                              <div className="break-all"><span className="font-medium">Serial:</span> {result.assetInfo.serialNumber}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {result.deviceInfo && !result.assetInfo && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <div className="font-medium text-blue-800 mb-1">Device Detected</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-blue-700">
                            <span>Type: {result.deviceInfo.type}</span>
                            {result.deviceInfo.model && <span>Model: {result.deviceInfo.model}</span>}
                            {result.deviceInfo.serial && <span className="break-all">Serial: {result.deviceInfo.serial}</span>}
                            <span>Status: {result.deviceInfo.status}</span>
                          </div>
                        </div>
                      )}

                      {isValidUrl(result.data) && !result.deviceInfo && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-2">
                          URL detected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPanel;
