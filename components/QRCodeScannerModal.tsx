
import React, { useEffect, useState } from 'react';

declare const Html5Qrcode: any;

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const qrReaderId = "qr-reader";
  const [isRendering, setIsRendering] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
    } else {
      setTimeout(() => setIsRendering(false), 400); // Match animation duration
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRendering) return;

    let html5QrCode: any;
    
    const startScanner = async () => {
        // Delay scanner initialization to allow modal animation to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                const container = document.getElementById(qrReaderId);
                if (!container) return; // Exit if modal was closed before scanner could start
                
                html5QrCode = new Html5Qrcode(qrReaderId);
                html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText: string, decodedResult: any) => {
                        html5QrCode.stop().then(() => {
                            onScanSuccess(decodedText);
                        }).catch((err: any) => console.error("Failed to stop scanner", err));
                    },
                    (errorMessage: string) => {
                        // Optional: handle scan errors, e.g., QR not found
                    }
                ).catch((err: any) => {
                    console.error("Unable to start scanning.", err);
                    alert("Error: Could not start the camera. Please check permissions.");
                    onClose();
                });
            } else {
                alert("No camera found on this device.");
                onClose();
            }
        } catch (err) {
            console.error("Camera permission error.", err);
            alert("Camera permission is required to scan QR codes.");
            onClose();
        }
    };

    if(isOpen) startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: any) => {
          console.error("Failed to stop QR scanner on cleanup.", err);
        });
      }
    };
  }, [isRendering, isOpen, onScanSuccess, onClose]);
  
  if (!isRendering) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`glass-pane w-full max-w-md p-4 relative animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-4 text-primary">Scan a QR Code</h2>
        <div id={qrReaderId} className="w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black"></div>
         <button
            onClick={onClose}
            aria-label="Close scanner"
            className="absolute top-4 right-4 close-button-glass"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default QRCodeScannerModal;
