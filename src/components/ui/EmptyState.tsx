import './EmptyState.css';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-icon">{icon}</div>
      <h3 className="ui-empty-title">{title}</h3>
      <p className="ui-empty-desc">{description}</p>
      {actionLabel && onAction && (
        <button className="primary-btn ui-empty-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
