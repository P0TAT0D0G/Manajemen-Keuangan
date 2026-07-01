import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { validateWallet } from '../schemas/validation';
import { Wallet as WalletIcon } from 'lucide-react';
import CurrencyInput from '../components/ui/CurrencyInput';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const { addWallet } = useData();

  const [step, setStep] = useState(1);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'Cash' | 'Bank' | 'E-Wallet'>('Cash');
  const [openingBalance, setOpeningBalance] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateWallet({
      name: walletName,
      openingBalance: Number(openingBalance)
    });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    addWallet({
      name: walletName,
      type: walletType,
      openingBalance: Number(openingBalance)
    });

    localStorage.setItem('onboarding_complete', 'true');
    navigate('/');
  };

  return (
    <div className="onboarding-container fade-in">
      <div className="onboarding-card">
        {step === 1 && (
          <div className="onboarding-step text-center fade-in">
            <div className="onboarding-icon-wrapper">
              <WalletIcon size={48} className="text-primary" />
            </div>
            <h1 className="onboarding-title">Selamat Datang di P0TAT0D0G</h1>
            <p className="onboarding-desc">
              Kelola keuangan Anda dengan lebih mudah, rapi, dan terstruktur. Mari mulai dengan membuat dompet pertama Anda.
            </p>
            <button className="primary-btn w-full justify-center" onClick={() => setStep(2)}>
              Mulai Sekarang
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step fade-in">
            <h2 className="onboarding-title mb-6">Buat Dompet Pertama</h2>
            <form onSubmit={handleCreateWallet} className="tx-form">
              <div className="form-group">
                <label htmlFor="wallet-name">Nama Dompet</label>
                <input 
                  id="wallet-name" 
                  type="text" 
                  value={walletName} 
                  onChange={e => setWalletName(e.target.value)} 
                  placeholder="Misal: Dompet Utama, Rekening BCA" 
                  required 
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="wallet-type">Tipe Dompet</label>
                <select id="wallet-type" value={walletType} onChange={e => setWalletType(e.target.value as any)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>

              <CurrencyInput
                id="opening-balance"
                label="Saldo Saat Ini"
                value={openingBalance}
                onChange={setOpeningBalance}
                error={errors.openingBalance}
                required
              />

              <div className="onboarding-actions mt-6">
                <button type="button" className="secondary-btn flex-1 justify-center" onClick={() => setStep(1)}>
                  Kembali
                </button>
                <button type="submit" className="primary-btn flex-1 justify-center">
                  Selesai
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
