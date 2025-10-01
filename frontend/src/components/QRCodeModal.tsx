import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';
import { useRef } from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  shortId: string;
}

export default function QRCodeModal({ isOpen, onClose, url, shortId }: QRCodeModalProps) {
  const qrCodeRef = useRef<SVGSVGElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleDownload = () => {
    if (qrCodeRef.current) {
      const svgData = new XMLSerializer().serializeToString(qrCodeRef.current);
      const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${shortId}-qrcode.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-xs p-6 m-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-4">Scan QR Code</h3>

        <div className="mb-4">
          <QRCodeSVG
            ref={qrCodeRef}
            value={url}
            size={200}
            level={"H"}
            includeMargin={true}
            className="mx-auto"
          />
        </div>
        <p className="text-sm text-gray-500 break-all mb-4">{url}</p>

        <button
          onClick={handleDownload}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Download SVG
        </button>
      </div>
    </div>
  );
}