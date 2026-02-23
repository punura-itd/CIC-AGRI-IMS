import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
  downloadable?: boolean;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 200,
  label,
  downloadable = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrcodeDataURL, setQrcodeDataURL] = React.useState<string>('');

  // Extract asset code from data (could be JSON string or plain asset code)
  const extractAssetCode = (data: string): string => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(data);
      return parsed.assetCode || parsed.asset_code || data;
    } catch {
      // If not JSON, check if it's already an asset code format
      // Asset codes are typically alphanumeric (e.g., LAPTOP001, ASSET123)
      if (/^[A-Z0-9-]{3,}$/i.test(data.trim())) {
        return data.trim();
      }
      // If it looks like JSON but failed to parse, try to extract asset code pattern
      const match = data.match(/["']?assetCode["']?\s*[:=]\s*["']?([A-Z0-9-]+)["']?/i);
      if (match && match[1]) {
        return match[1];
      }
      // Fallback: return the data as-is if we can't extract
      return data;
    }
  };

  useEffect(() => {
    if (canvasRef.current && data) {
      // Extract only the asset code for shorter QR code
      const assetCode = extractAssetCode(data);
      
      // Generate QR code on canvas using only asset code
      QRCode.toCanvas(canvasRef.current, assetCode, {
        width: size,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      })
        .then(() => {
          // Generate data URL for download
          const dataURL = canvasRef.current?.toDataURL('image/png');
          if (dataURL) {
            setQrcodeDataURL(dataURL);
          }
        })
        .catch((error: Error) => {
          console.error('QR code generation error:', error);
        });
    }
  }, [data, size]);

  const handleDownload = () => {
    if (qrcodeDataURL) {
      const link = document.createElement('a');
      link.download = `${label || 'asset'}-qrcode.png`;
      link.href = qrcodeDataURL;
      link.click();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <h4 className="text-sm font-medium text-slate-700 mb-3">{label}</h4>
      )}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full max-w-md">
        <canvas
          ref={canvasRef}
          className="block w-full"
        />
      </div>
      <div className="mt-3 text-center">
        
      </div>
      {downloadable && (
        <button
          onClick={handleDownload}
          className="mt-3 flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Download size={14} />
          Download QR Code
        </button>
      )}
    </div>
  );
};

export default QRCodeDisplay;
