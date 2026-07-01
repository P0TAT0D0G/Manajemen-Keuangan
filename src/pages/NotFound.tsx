import { Home } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState
        icon={<Home size={64} />}
        title="Halaman Tidak Ditemukan"
        description="Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan."
        actionLabel="Kembali ke Beranda"
        onAction={() => { window.location.href = '/'; }}
      />
    </div>
  );
}
