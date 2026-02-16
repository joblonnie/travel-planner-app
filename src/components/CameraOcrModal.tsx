import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Plus, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency.ts';
import { useI18n, type TranslationKey } from '../i18n/useI18n.ts';

type DetectedCurrency = 'EUR' | 'USD' | 'JPY';

interface Props {
  onClose: () => void;
  onAddExpense: (amount: number, currency: string) => void;
}

type Step = 'camera' | 'processing' | 'result';

const CURRENCY_SYMBOLS: Record<DetectedCurrency, string> = { EUR: '€', USD: '$', JPY: '¥' };
const DEFAULT_TO_KRW: Record<DetectedCurrency, number> = { EUR: 1450, USD: 1350, JPY: 9.5 };

interface ExtractedAmount {
  amount: number;
  currency: DetectedCurrency;
}

function extractCurrencyAmount(text: string): ExtractedAmount | null {
  // EUR patterns (highest priority - travel in Europe)
  const eurPatterns: [RegExp, DetectedCurrency][] = [
    [/€\s*(\d{1,6}[.,]\d{2})/, 'EUR'],
    [/€\s*(\d{1,6})/, 'EUR'],
    [/(\d{1,6}[.,]\d{2})\s*€/, 'EUR'],
    [/EUR\s*(\d{1,6}[.,]?\d{0,2})/i, 'EUR'],
  ];

  // USD patterns
  const usdPatterns: [RegExp, DetectedCurrency][] = [
    [/\$\s*(\d{1,6}[.,]\d{2})/, 'USD'],
    [/\$\s*(\d{1,6})/, 'USD'],
    [/(\d{1,6}[.,]\d{2})\s*\$/, 'USD'],
    [/USD\s*(\d{1,6}[.,]?\d{0,2})/i, 'USD'],
  ];

  // JPY patterns
  const jpyPatterns: [RegExp, DetectedCurrency][] = [
    [/[¥￥]\s*(\d{1,8}[.,]?\d{0,2})/, 'JPY'],
    [/(\d{1,8})\s*[¥￥]/, 'JPY'],
    [/(\d{1,8})\s*円/, 'JPY'],
    [/JPY\s*(\d{1,8}[.,]?\d{0,2})/i, 'JPY'],
  ];

  const allPatterns = [...eurPatterns, ...usdPatterns, ...jpyPatterns];

  for (const [pattern, currency] of allPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(',', '.');
      const val = parseFloat(numStr);
      const maxVal = currency === 'JPY' ? 10000000 : 100000;
      if (!isNaN(val) && val > 0 && val < maxVal) {
        return { amount: val, currency };
      }
    }
  }

  // Fallback: any decimal number (assume EUR for European travel)
  const fallback = text.match(/(\d{1,6}[.,]\d{2})/);
  if (fallback) {
    const val = parseFloat(fallback[1].replace(',', '.'));
    if (!isNaN(val) && val > 0 && val < 100000) {
      return { amount: val, currency: 'EUR' };
    }
  }

  return null;
}

export function CameraOcrModal({ onClose, onAddExpense }: Props) {
  const { t } = useI18n();
  const { exchangeRate } = useCurrency();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>('camera');
  const [error, setError] = useState<string | null>(null);
  const [detectedAmount, setDetectedAmount] = useState<number | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<DetectedCurrency>('EUR');
  const [ocrText, setOcrText] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCurrency, setManualCurrency] = useState<DetectedCurrency>('EUR');
  const [isManualMode, setIsManualMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError(t('camera.permissionDenied'));
      } else {
        setError(t('camera.notSupported'));
      }
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const preprocessCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    // Grayscale + contrast enhancement for better OCR
    for (let i = 0; i < data.length; i += 4) {
      let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Increase contrast
      gray = gray < 128 ? Math.max(0, gray * 0.6) : Math.min(255, gray * 1.2 + 30);
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    // Create a separate canvas for OCR (not tied to React ref lifecycle)
    const ocrCanvas = document.createElement('canvas');
    ocrCanvas.width = video.videoWidth;
    ocrCanvas.height = video.videoHeight;
    const ctx = ocrCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Save captured image as data URL for preview
    setCapturedImage(ocrCanvas.toDataURL('image/jpeg', 0.8));

    stopCamera();
    setStep('processing');

    // Preprocess for better OCR
    preprocessCanvas(ocrCanvas);

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(['eng', 'spa']);
      const { data: { text } } = await worker.recognize(ocrCanvas);
      await worker.terminate();

      setOcrText(text);
      const result = extractCurrencyAmount(text);
      if (result) {
        setDetectedAmount(result.amount);
        setDetectedCurrency(result.currency);
      } else {
        setDetectedAmount(null);
        setIsManualMode(true);
      }
      setStep('result');
    } catch {
      setStep('result');
      setDetectedAmount(null);
      setIsManualMode(true);
    }
  };

  const handleRetake = () => {
    setStep('camera');
    setDetectedAmount(null);
    setManualAmount('');
    setIsManualMode(false);
    setManualCurrency('EUR');
    setOcrText('');
    setCapturedImage(null);
    startCamera();
  };

  const handleAddExpense = () => {
    const amount = isManualMode ? parseFloat(manualAmount) : detectedAmount;
    const cur = isManualMode ? manualCurrency : detectedCurrency;
    if (amount && amount > 0) {
      onAddExpense(amount, cur);
    }
  };

  const currentAmount = isManualMode ? parseFloat(manualAmount) || 0 : detectedAmount || 0;

  const toKrw = (amount: number, cur: DetectedCurrency): number => {
    if (cur === 'EUR') return Math.round(amount * exchangeRate);
    return Math.round(amount * DEFAULT_TO_KRW[cur]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-100/50 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100/80 bg-gradient-to-r from-warm-50 to-amber-50/30 sm:rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-spain-red" />
            <h3 className="font-bold text-spain-dark">{t('camera.title')}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-3 text-red-400" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                onClick={() => { setError(null); setIsManualMode(true); setStep('result'); }}
                className="mt-4 text-sm text-spain-red font-bold hover:underline"
              >
                {t('camera.manualInput')}
              </button>
            </div>
          ) : step === 'camera' ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover bg-black"
              />
              {/* Capture overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
                <button
                  onClick={handleCapture}
                  className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-spain-red" />
                </button>
              </div>
            </div>
          ) : step === 'processing' ? (
            <div className="p-12 text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-spain-red animate-spin" />
              <p className="text-sm text-gray-600 font-medium">{t('camera.detecting')}</p>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Preview image */}
              {capturedImage && (
                <img src={capturedImage} alt="captured" className="w-full rounded-xl border border-gray-100 max-h-40 object-contain" />
              )}

              {/* OCR detected text */}
              {ocrText && (
                <div className="text-xs">
                  <p className="text-gray-400 font-medium mb-1">{t('camera.ocrResult' as TranslationKey)}</p>
                  <pre className="p-2.5 bg-gray-50 rounded-lg text-gray-600 whitespace-pre-wrap break-all max-h-24 overflow-y-auto border border-gray-100 leading-relaxed">{ocrText}</pre>
                </div>
              )}

              {/* Detected / Manual amount */}
              {!isManualMode && detectedAmount ? (
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">{t('camera.detected')}</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-3xl font-bold text-spain-dark">
                      {CURRENCY_SYMBOLS[detectedCurrency]}
                      {detectedCurrency === 'JPY' ? detectedAmount.toLocaleString() : detectedAmount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => { setIsManualMode(true); setManualAmount(detectedAmount.toString()); setManualCurrency(detectedCurrency); }}
                      className="p-2 text-gray-400 hover:text-spain-red transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                  <p className="text-lg text-gray-500 font-medium">
                    ≈ ₩{toKrw(detectedAmount, detectedCurrency).toLocaleString('ko-KR')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {!detectedAmount && (
                    <p className="text-xs text-amber-600 font-medium text-center mb-2">{t('camera.noAmount')}</p>
                  )}
                  <label className="block text-xs font-medium text-gray-500">{t('camera.manualInput')}</label>
                  {/* Currency selector pills */}
                  <div className="flex gap-1 justify-center mb-2">
                    {(['EUR', 'USD', 'JPY'] as DetectedCurrency[]).map((cur) => (
                      <button
                        key={cur}
                        onClick={() => setManualCurrency(cur)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
                          manualCurrency === cur
                            ? 'bg-spain-red text-white shadow-sm'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {CURRENCY_SYMBOLS[cur]} {cur}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step={manualCurrency === 'JPY' ? '1' : '0.01'}
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder={manualCurrency === 'JPY' ? '0' : '0.00'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold text-center focus:ring-2 focus:ring-spain-yellow/30 focus:border-spain-yellow/60 outline-none"
                    autoFocus
                  />
                  {parseFloat(manualAmount) > 0 && (
                    <p className="text-center text-sm text-gray-500">
                      ≈ ₩{toKrw(parseFloat(manualAmount), manualCurrency).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  <RotateCcw size={16} /> {t('camera.retake')}
                </button>
                <button
                  onClick={handleAddExpense}
                  disabled={currentAmount <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-spain-red to-rose-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-spain-red/20 transition-all min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Plus size={16} /> {t('camera.addExpense')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
