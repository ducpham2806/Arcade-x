import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { downloadOfflinePackage } from '../games/gamePackages';

export function OfflineGameDownload({ manifestUrl }: { manifestUrl: string }) {
  const request = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => () => request.current?.abort(), []);

  const download = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setStatus('Đang chuẩn bị gói…');
    try {
      await downloadOfflinePackage(manifestUrl, controller.signal, (done, total) => {
        if (!controller.signal.aborted) setStatus(`Đang tải ${done}/${total} tệp…`);
      });
      if (!controller.signal.aborted) setStatus('Đã lưu gói chơi ngoại tuyến.');
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error && error.message.startsWith('Tải lại trang')
        ? error.message
        : 'Chưa tải xong gói. Kiểm tra kết nối và thử lại.';
      controller.abort();
      setStatus(message);
      setBusy(false);
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return <div className="space-y-2">
    <button type="button" className="simple-secondary-button" disabled={busy} onClick={() => void download()}>
      <Download size={16} /> Tải gói chơi ngoại tuyến
    </button>
    <p role="status" className="text-sm text-slate-300">{status}</p>
  </div>;
}
