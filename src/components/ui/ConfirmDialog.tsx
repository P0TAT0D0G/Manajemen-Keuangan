import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'warning'
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger';
  const Icon = isDanger ? Trash2 : AlertTriangle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog-content">
        <div className={`confirm-icon-wrapper ${variant}`}>
          <Icon size={24} />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="secondary-btn" onClick={onClose}>
            {cancelLabel}
          </button>
          <button 
            className={isDanger ? 'danger-btn' : 'warning-btn'} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
