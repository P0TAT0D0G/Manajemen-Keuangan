import './CurrencyInput.css';

interface CurrencyInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  autoFocus?: boolean;
  required?: boolean;
}

export default function CurrencyInput({
  id,
  value,
  onChange,
  label,
  error,
  autoFocus,
  required
}: CurrencyInputProps) {
  // Format the raw value string into a dotted string (e.g., "1450000" -> "1.450.000")
  const displayValue = value
    ? value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip all non-digit characters before passing up to parent
    const rawValue = e.target.value.replace(/\D/g, '');
    onChange(rawValue);
  };

  return (
    <div className="ui-currency-group">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="ui-currency-wrapper">
        <span className="ui-currency-symbol">Rp</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          required={required}
          autoFocus={autoFocus}
          value={displayValue}
          onChange={handleChange}
          className={`ui-currency-input tabular-nums ${error ? 'has-error' : ''}`}
          placeholder="0"
        />
      </div>
      {error && <span className="ui-currency-error">{error}</span>}
    </div>
  );
}
