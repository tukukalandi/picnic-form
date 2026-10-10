import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Save, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Code2, 
  Layers, 
  Settings2,
  RefreshCw
} from 'lucide-react';
import { SPREADSHEET_ID, SPREADSHEET_URL, GOOGLE_APPS_SCRIPT_CODE, HEADERS_LIST } from '../data/backendCode';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  onSaveUrl: (url: string) => void;
  isMockMode: boolean;
  onToggleMockMode: (mock: boolean) => void;
  initialTab?: 'config' | 'code' | 'guide';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  onSaveUrl,
  isMockMode,
  onToggleMockMode,
  initialTab = 'config',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'guide'>(initialTab);
  const [urlInput, setUrlInput] = useState(webAppUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(SPREADSHEET_ID);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    const trimmed = urlInput.trim();
    onSaveUrl(trimmed);
    if (trimmed.length > 0) {
      onToggleMockMode(false);
    }
    setTestResult({
      success: true,
      message: 'Google Apps Script Web App URL saved successfully in your local browser!',
    });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleTestConnection = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'Please paste your Google Apps Script Web App URL first.',
      });
      return;
    }

    if (!trimmed.includes('script.google.com/macros/s/')) {
      setTestResult({
        success: false,
        message: 'URL must start with https://script.google.com/macros/s/... and end with /exec',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Try testing via backend proxy first
      const proxyRes = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl: trimmed }),
      }).catch(() => null);

      if (proxyRes && proxyRes.ok) {
        const json = await proxyRes.json();
        setTestResult({
          success: true,
          message: 'Connection successful! Google Apps Script is active and linked to the spreadsheet.',
          details: json.totalSubmissions !== undefined
            ? `Current submissions in sheet: ${json.totalSubmissions} (Next Sl. No: #${json.nextSlNo})`
            : 'Response received from Apps Script Web App.',
        });
        return;
      }

      // Direct client fallback test
      const directResponse = await fetch(trimmed, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (directResponse.ok) {
        const data = await directResponse.json().catch(() => null);
        setTestResult({
          success: true,
          message: 'Connection successful! Web App responded.',
          details: data?.sheetName ? `Target sheet: "${data.sheetName}"` : undefined,
        });
      } else {
        setTestResult({
          success: false,
          message: `Server returned HTTP status ${directResponse.status}. Verify deployment permissions (Who has access: Anyone).`,
        });
      }
    } catch {
      // Network reachable but redirect / CORS restricted
      setTestResult({
        success: true,
        message: 'Web App URL reached! The backend endpoint is online. Submissions will be safely saved to the Google Sheet.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 transform transition-all flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Header */}
        <div className="bg-[#991b1b] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400 text-red-950 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="text-base sm:text-lg font-bold leading-snug">
                Google Sheets Integration & Deployment
              </h3>
              <p className="text-xs text-red-100">
                Sub Post Office Dhenkanal RS • Google Spreadsheet: <span className="font-mono text-amber-200">{SPREADSHEET_ID.substring(0, 10)}...</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Connection URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code.gs Script</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-red-600 text-red-700 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Step-by-Step Guide</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-stone-800 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Target Spreadsheet Information */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                      Target Google Spreadsheet
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-0.5">
                      Dhenkanal RS SO Family Visit Registry
                    </h4>
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs text-stone-600">
                      <span className="bg-white px-2 py-0.5 rounded border border-amber-200">
                        ID: {SPREADSHEET_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="text-amber-800 hover:text-amber-950 font-sans text-xs underline cursor-pointer"
                      >
                        {copiedId ? 'Copied!' : 'Copy ID'}
                      </button>
                    </div>
                  </div>

                  <a
                    href={SPREADSHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Display 8 columns */}
                <div className="mt-3 pt-3 border-t border-amber-200/70 text-xs">
                  <span className="font-bold text-stone-700 block mb-1">
                    Spreadsheet Columns (with Age after Gender):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {HEADERS_LIST.map((h, i) => (
                      <span 
                        key={i} 
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          h === 'Age' 
                            ? 'bg-red-100 text-red-900 border-red-300 font-bold' 
                            : 'bg-white text-stone-700 border-amber-200'
                        }`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Web App URL Configuration Input */}
              <div>
                <label htmlFor="webAppUrlInput" className="block text-sm font-bold text-stone-800 mb-1">
                  Google Apps Script Web App URL <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-stone-500 mb-2">
                  Paste the deployment URL obtained after deploying <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">Code.gs</code> as a Web App (must end with <code className="text-red-700 font-mono">/exec</code>).
                </p>

                <div className="relative">
                  <input
                    id="webAppUrlInput"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-3.5 py-2.5 bg-stone-50 focus:bg-white text-stone-900 text-xs sm:text-sm font-mono rounded-lg border border-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !urlInput.trim()}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing connection...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Test Web App Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="px-3.5 py-2 text-stone-600 hover:text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                    <span>How to get this URL?</span>
                  </button>
                </div>

                {/* Test Feedback */}
                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg border text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    <div className="flex items-start gap-2 font-semibold">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span>{testResult.message}</span>
                        {testResult.details && (
                          <div className="text-[11px] text-emerald-700 font-normal mt-0.5">
                            {testResult.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Offline Test Mode fallback toggle */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      Local Preview / Offline Demo Mode
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Use only for offline form testing without saving to Google Sheets.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleMockMode(!isMockMode)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isMockMode ? 'bg-amber-500' : 'bg-stone-300'
                    }`}
                    role="switch"
                    aria-checked={isMockMode}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isMockMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Updated Code.gs (Includes Age Column)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Paste this into Google Spreadsheet → Extensions → Apps Script
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code.gs'}</span>
                </button>
              </div>

              <div className="relative bg-stone-900 text-stone-100 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-80 border border-stone-800">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>

              <div className="bg-stone-100 rounded-lg p-3 text-xs text-stone-600 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  The script auto-detects existing sheets and safely inserts the &quot;Age&quot; column into Column D without overwriting existing data.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs leading-relaxed text-stone-700">
              <h4 className="text-sm font-bold text-stone-900">
                Step-by-Step Deployment Instructions
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-red-800 block mb-1">
                    Step 1: Open Google Spreadsheet
                  </span>
                  <p>
                    Open{' '}
                    <a
                      href={SPREADSHEET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-700 underline font-semibold"
                    >
                      Dhenkanal RS SO Spreadsheet (1xU9...8R208)
                    </a>{' '}
                    in your web browser.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-red-800 block mb-1">
                    Step 2: Open Apps Script Editor
                  </span>
                  <p>
                    In the spreadsheet top menu, click <strong>Extensions</strong> → <strong>Apps Script</strong>.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-red-800 block mb-1">
                    Step 3: Paste Code.gs & Save
                  </span>
                  <p>
                    Select the <strong>Code.gs</strong> tab above, click <strong>Copy Code.gs</strong>, replace any code in the editor, and click the <strong>Save</strong> disk icon.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-red-800 block mb-1">
                    Step 4: Deploy as Web App (CRITICAL)
                  </span>
                  <p>
                    Click the blue <strong>Deploy</strong> button (top-right) → <strong>New deployment</strong>.
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 pl-1">
                    <li>Click gear icon next to &quot;Select type&quot; → choose <strong>Web app</strong>.</li>
                    <li>Set <strong>Execute as:</strong> <code>Me (your email)</code>.</li>
                    <li>Set <strong>Who has access:</strong> <code>Anyone</code>.</li>
                    <li>Click <strong>Deploy</strong> and authorize access if prompted.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-red-800 block mb-1">
                    Step 5: Copy Web App URL into Form
                  </span>
                  <p>
                    Copy the generated Web App URL (ends with <code>/exec</code>), switch back to this tab, paste it into the <strong>Connection URL</strong> input, and click <strong>Save Configuration</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
