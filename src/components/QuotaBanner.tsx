import React, { useState, useEffect } from 'react';

export const QuotaBanner: React.FC = () => {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  if (!quotaExceeded) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-between gap-4">
      <div className="flex-1 text-center">
        <span>
          Interactive Map Platform quota reached. If you are the app owner, visit{' '}
          <a
            href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-amber-950 hover:text-amber-800"
          >
            developer site
          </a>{' '}
          for instructions to update your account.
        </span>
      </div>
      <button
        onClick={() => setQuotaExceeded(false)}
        className="text-amber-800 hover:text-amber-950 text-xs px-2 py-1 rounded bg-amber-100 hover:bg-amber-200"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
};
