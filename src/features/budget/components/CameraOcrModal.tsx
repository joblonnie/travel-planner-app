import { useState, useRef, useCallback, useEffect } from 'react';
import { Calculator, Camera, X, RotateCcw, Plus, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import type { Currency } from '@/hooks/useCurrency.ts';
import { useTripStore } from '@/store/useTripStore.ts';
import { useI18n } from '@/i18n/useI18n.ts';

type DetectedCurrency = 'EUR' | 'USD' | 'JPY' | 'CNY';
type Tab = 'calculator' | 'ocr';

interface Props {
  onClose: () => void;
  onAddExpense: (amount: number, currency: string) => void;
}

type Step = 'camera' | 'processing' | 'result';

const CURRENCY_SYMBOLS: Record<DetectedCurrency, string> = { EUR: '€', USD: '$', JPY: '¥', CNY: '元' };

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
    [/(\d{1,8})\s*円/, 'JPY'],
    [/JPY\s*(\d{1,8}[.,]?\d{0,2})/i, 'JPY'],
  ];

  // CNY patterns (¥/￥ ambiguous with JPY — CNY uses 元/RMB/CNY keywords)
  const cnyPatterns: [RegExp, DetectedCurrency][] = [
    [/(\d{1,6}[.,]?\d{0,2})\s*元/, 'CNY'],
    [/RMB\s*(\d{1,6}[.,]?\d{0,2})/i, 'CNY'],
    [/CNY\s*(\d{1,6}[.,]?\d{0,2})/i, 'CNY'],
  ];

  // ¥ symbol: try JPY first (higher amounts typical), then fallback
  const yenSymbolPatterns: [RegExp, DetectedCurrency][] = [
    [/[¥￥]\s*(\d{1,8}[.,]?\d{0,2})/, 'JPY'],
    [/(\d{1,8})\s*[¥￥]/, 'JPY'],
  ];

  const allPatterns = [...eurPatterns, ...usdPatterns, ...cnyPatterns, ...jpyPatterns, ...yenSymbolPatterns];

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

  // Fallback: any decimal number (assume EUR for European travel receipts)
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
  const fetchedRates = useTripStore((s) => s.fetchedRates);
  const ratesMap: Record<Currency, number> = { KRW: 1, EUR: 0.00069, USD: 0.00074, JPY: 0.114, CNY: 0.0054, ...(fetchedRates as Partial<Record<Currency, number>>) };
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Tab state
  const [tab, setTab] = useState<Tab>('calculator');

  // Calculator tab state
  const [calcCurrency, setCalcCurrency] = useState<DetectedCurrency>('EUR');
  const [calcAmount, setCalcAmount] = useState('');

  // OCR tab state
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

  // Start camera only when OCR tab is active; cleanup handles stopping
  useEffect(() => {
    if (tab === 'ocr' && step === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [tab, step, startCamera, stopCamera]);

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
  };

  const handleOcrAddExpense = () => {
    const amount = isManualMode ? parseFloat(manualAmount) : detectedAmount;
    const cur = isManualMode ? manualCurrency : detectedCurrency;
    if (amount && amount > 0) {
      onAddExpense(amount, cur);
    }
  };

  const handleCalcAddExpense = () => {
    const amount = parseFloat(calcAmount);
    if (amount > 0) {
      onAddExpense(amount, calcCurrency);
    }
  };

  const ocrCurrentAmount = isManualMode ? parseFloat(manualAmount) || 0 : detectedAmount || 0;

  const toKrw = (amount: number, cur: DetectedCurrency): number => {
    const rate = ratesMap[cur];
    if (!rate || rate === 0) return Math.round(amount);
    return Math.round(amount / rate);
  };

  const formatKrw = (krw: number): string => {
    const hasDecimal = krw % 1 !== 0;
    return krw.toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: hasDecimal ? 2 : 0 });
  };

  const calcParsed = parseFloat(calcAmount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-backdrop" onClick={onClose}>
      <div
        className="bg-surface w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-200/80 max-h-[90vh] overflow-hidden flex flex-col animate-sheet-up sm:animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-warm-50 to-accent-cream/30 sm:rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-primary" />
            <h3 className="font-bold text-theme-dark">{t('camera.title')}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setTab('calculator')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all min-h-[44px] ${
              tab === 'calculator'
                ? 'text-primary border-b-2 border-primary bg-white/60'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calculator size={16} />
            {t('camera.tabCalc')}
          </button>
          <button
            onClick={() => setTab('ocr')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all min-h-[44px] ${
              tab === 'ocr'
                ? 'text-primary border-b-2 border-primary bg-white/60'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Camera size={16} />
            {t('camera.tabOcr')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'calculator' ? (
            /* ===== Calculator Tab ===== */
            <div className="p-5 space-y-5">
              {/* Currency selector pills */}
              <div>
                <div className="flex gap-1.5 justify-center">
                  {(['EUR', 'USD', 'JPY', 'CNY'] as DetectedCurrency[]).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setCalcCurrency(cur)}
                      className={`px-3 py-2 rounded-full text-sm font-bold transition-all min-h-[40px] ${
                        calcCurrency === cur
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {CURRENCY_SYMBOLS[cur]} {cur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t('budget.amount')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                    {CURRENCY_SYMBOLS[calcCurrency]}
                  </span>
                  <input
                    type="number"
                    step={calcCurrency === 'JPY' ? '1' : '0.01'}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    placeholder={calcCurrency === 'JPY' ? '0' : '0.00'}
                    className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Live conversion results — always rendered to prevent layout shift */}
              <div className="bg-gradient-to-br from-gray-50 to-warm-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center">
                <p className={`text-center text-2xl font-bold ${calcParsed > 0 ? 'text-theme-dark' : 'text-gray-300'}`}>
                  ₩{calcParsed > 0 ? formatKrw(toKrw(calcParsed, calcCurrency)) : '0'}
                </p>
              </div>

              {/* Add as expense button */}
              <button
                onClick={handleCalcAddExpense}
                disabled={calcParsed <= 0}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Plus size={16} /> {t('camera.addExpense')}
              </button>
            </div>
          ) : (
            /* ===== OCR Tab ===== */
            <>
              {error ? (
                <div className="p-8 text-center">
                  <AlertCircle size={48} className="mx-auto mb-3 text-red-400" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                  <button
                    onClick={() => { setError(null); setIsManualMode(true); setStep('result'); }}
                    className="mt-4 text-sm text-primary font-bold hover:underline"
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
                      <div className="w-12 h-12 rounded-full bg-primary" />
                    </button>
                  </div>
                </div>
              ) : step === 'processing' ? (
                <div className="p-12 text-center">
                  <Loader2 size={48} className="mx-auto mb-4 text-primary animate-spin" />
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
                      <p className="text-gray-400 font-medium mb-1">{t('camera.ocrResult')}</p>
                      <pre className="p-2.5 bg-gray-50 rounded-lg text-gray-600 whitespace-pre-wrap break-all max-h-24 overflow-y-auto border border-gray-100 leading-relaxed">{ocrText}</pre>
                    </div>
                  )}

                  {/* Detected / Manual amount */}
                  {!isManualMode && detectedAmount ? (
                    <div className="text-center space-y-2">
                      <p className="text-xs text-gray-500 font-medium">{t('camera.detected')}</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-3xl font-bold text-theme-dark">
                          {CURRENCY_SYMBOLS[detectedCurrency]}
                          {detectedCurrency === 'JPY' ? detectedAmount.toLocaleString() : detectedAmount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => { setIsManualMode(true); setManualAmount(detectedAmount.toString()); setManualCurrency(detectedCurrency); }}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                      <p className="text-lg text-gray-500 font-medium">
                        ≈ ₩{formatKrw(toKrw(detectedAmount, detectedCurrency))}
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
                        {(['EUR', 'USD', 'JPY', 'CNY'] as DetectedCurrency[]).map((cur) => (
                          <button
                            key={cur}
                            onClick={() => setManualCurrency(cur)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
                              manualCurrency === cur
                                ? 'bg-primary text-white shadow-sm'
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold text-center focus:ring-2 focus:ring-secondary/30 focus:border-secondary/60 outline-none"
                        autoFocus
                      />
                      {parseFloat(manualAmount) > 0 && (
                        <p className="text-center text-sm text-gray-500">
                          ≈ ₩{formatKrw(toKrw(parseFloat(manualAmount), manualCurrency))}
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
                      onClick={handleOcrAddExpense}
                      disabled={ocrCurrentAmount <= 0}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      <Plus size={16} /> {t('camera.addExpense')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
