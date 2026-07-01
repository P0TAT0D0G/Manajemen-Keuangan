import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  };
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="toast-icon success" size={20} />,
    warning: <AlertTriangle className="toast-icon warning" size={20} />,
    error: <XCircle className="toast-icon error" size={20} />,
    info: <Info className="toast-icon info" size={20} />
  };

  return (
    <div className={`ui-toast toast-${toast.type} fade-in`}>
      <div className="toast-content">
        {icons[toast.type]}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="icon-btn toast-close" onClick={onClose} aria-label="Tutup notifikasi">
        <X size={16} />
      </button>
    </div>
  );
}
