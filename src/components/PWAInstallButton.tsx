import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, ExternalLink, PackageCheck, Terminal, Copy, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{
  variant?: 'navbar' | 'hero' | 'card';
}> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'apk' | 'ios' | 'desktop'>('android');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-wpovbsazin4g5wuckkeotd-861836259795.asia-southeast1.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;
  const bubblewrapCmd = `npx @bubblewrap/cli init --manifest=${appUrl}/manifest.webmanifest && npx @bubblewrap/cli build`;

  const copyCommand = () => {
    navigator.clipboard?.writeText(bubblewrapCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  // If already running as an installed standalone app
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 bg-[#e5f1dc] text-[#28583d] text-xs font-bold px-3 py-1.5 rounded-full">
          <Check className="w-3.5 h-3.5" />
          <span>App Installed on Device</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'navbar' ? (
        <div className="flex items-center gap-1.5">
          {isInstallable ? (
            <button
              onClick={install}
              className="bg-[#ff5c7a] hover:bg-[#f04f6e] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
              aria-label="Install MyLocal Mate App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab(isIOS ? 'ios' : 'android');
                setShowModalInfo(true);
              }}
              className="bg-[#073f3a]/10 hover:bg-[#073f3a] text-[#073f3a] hover:text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#ff5c7a]" />
              <span>Get App / APK</span>
            </button>
          )}
        </div>
      ) : variant === 'hero' ? (
        <div className="flex flex-wrap items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="bg-[#ff5c7a] hover:bg-[#f04f6e] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>1-Tap Install App</span>
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('apk');
              setShowModalInfo(true);
            }}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-2 backdrop-blur-xs"
          >
            <PackageCheck className="w-4 h-4 text-[#ffeb9a]" />
            <span>Download APK / Install Info</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setActiveTab('android');
            setShowModalInfo(true);
          }}
          className="bg-white border border-[#e9e5dc] text-[#073f3a] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#faf7f2] transition-all flex items-center gap-1.5"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#ff5c7a]" />
          <span>Install or Get APK</span>
        </button>
      )}

      {showModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#f7f3eb] p-6 shadow-2xl border border-[#e9e5dc] text-[#172b2a] space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModalInfo(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-gray-500 hover:text-black grid place-items-center font-bold text-sm shadow-xs"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#073f3a] text-white grid place-items-center font-bold text-base shadow-xs">
                📲
              </span>
              <div>
                <h3 className="text-base font-extrabold text-[#172b2a]">MyLocal Mate Android & App Hub</h3>
                <p className="text-[11px] text-[#6f7d79]">Choose your preferred install or download method</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-[#e9e5dc] text-xs font-bold">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'android'
                    ? 'bg-[#073f3a] text-white shadow-xs'
                    : 'text-[#6f7d79] hover:text-[#172b2a]'
                }`}
              >
                🤖 Android 1-Tap
              </button>
              <button
                onClick={() => setActiveTab('apk')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'apk'
                    ? 'bg-[#ff5c7a] text-white shadow-xs'
                    : 'text-[#6f7d79] hover:text-[#172b2a]'
                }`}
              >
                📦 APK Package
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'ios'
                    ? 'bg-[#073f3a] text-white shadow-xs'
                    : 'text-[#6f7d79] hover:text-[#172b2a]'
                }`}
              >
                🍎 iOS Safari
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'desktop'
                    ? 'bg-[#073f3a] text-white shadow-xs'
                    : 'text-[#6f7d79] hover:text-[#172b2a]'
                }`}
              >
                💻 Desktop
              </button>
            </div>

            {/* TAB CONTENT: ANDROID 1-TAP (WebAPK) */}
            {activeTab === 'android' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="bg-[#e5f1dc] border border-[#bedbaf] p-3.5 rounded-2xl text-[#28583d]">
                  <strong className="block text-sm font-extrabold mb-1">✨ Best Method for Android (No APK file needed!)</strong>
                  <p className="leading-relaxed">
                    Android uses <strong>WebAPK technology</strong>: Chrome automatically builds, verifies, and installs a native APK directly to your phone launcher without manual sideloading or "Unknown Sources" warnings.
                  </p>
                </div>

                <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#e9e5dc]">
                  <div className="font-bold text-[#172b2a] mb-1">How to install on Android in 10 seconds:</div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#f7f3eb] font-bold text-[#073f3a] grid place-items-center shrink-0">1</span>
                    <span>Open this website in <strong>Google Chrome</strong> on your Android phone.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#f7f3eb] font-bold text-[#073f3a] grid place-items-center shrink-0">2</span>
                    <span>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#f7f3eb] font-bold text-[#073f3a] grid place-items-center shrink-0">3</span>
                    <span>Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#f7f3eb] font-bold text-[#073f3a] grid place-items-center shrink-0">4</span>
                    <span>Done! MyLocal Mate appears in your app drawer just like any Google Play app.</span>
                  </div>
                </div>

                {isInstallable && (
                  <button
                    onClick={install}
                    className="w-full rounded-2xl bg-[#073f3a] hover:bg-[#063430] text-white font-bold py-3 text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4 text-[#ffeb9a]" />
                    <span>Trigger Android Native Install Now</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB CONTENT: STANDALONE APK */}
            {activeTab === 'apk' && (
              <div className="space-y-3.5 animate-in fade-in duration-150 text-xs">
                <div className="bg-[#fff4e5] border border-[#fed7aa] p-3.5 rounded-2xl text-[#9a3412]">
                  <strong className="block text-sm font-extrabold mb-1">Looking for a raw .APK file?</strong>
                  <p className="leading-relaxed">
                    Because this app is a live Progressive Web App, you don't actually need an APK to install it on Android. However, if you need a standalone <strong>.apk</strong> or <strong>.aab</strong> file for manual sideloading or Google Play Store submission, you can package it instantly:
                  </p>
                </div>

                {/* Option 1: PWABuilder 1-Click */}
                <div className="bg-white p-4 rounded-2xl border border-[#e9e5dc] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#172b2a] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#073f3a] text-white text-[11px] grid place-items-center font-bold">1</span>
                      Instant 1-Click APK Generator (PWABuilder)
                    </span>
                    <span className="bg-[#ffeb9a] text-[#713f12] text-[10px] font-black px-2 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <p className="text-[#6f7d79] text-[11px] leading-relaxed">
                    PWABuilder (created by Microsoft & Google) reads our manifest (`/manifest.webmanifest`) and generates a signed or debug APK for you:
                  </p>
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-xl bg-[#ff5c7a] hover:bg-[#f04f6e] text-white font-bold py-2.5 text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Open PWABuilder with App URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[10px] text-gray-400 text-center">
                    Click "Package for Stores" ➔ "Android" to download your APK or AAB.
                  </p>
                </div>

                {/* Option 2: CLI / Developer Build */}
                <div className="bg-white p-4 rounded-2xl border border-[#e9e5dc] space-y-2">
                  <span className="font-extrabold text-[#172b2a] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#073f3a] text-white text-[11px] grid place-items-center font-bold">2</span>
                    Generate APK via Google Bubblewrap CLI
                  </span>
                  <p className="text-[#6f7d79] text-[11px]">
                    Using Node.js on your computer to build an APK using Trusted Web Activities (TWA):
                  </p>
                  <div className="bg-[#172b2a] text-[#e0ece8] p-2.5 rounded-xl flex items-center justify-between font-mono text-[10px] overflow-x-auto">
                    <code>{bubblewrapCmd}</code>
                    <button
                      onClick={copyCommand}
                      className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-sans text-[10px] shrink-0 flex items-center gap-1"
                    >
                      {copiedCmd ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: IOS */}
            {activeTab === 'ios' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                <p className="text-[#6f7d79] leading-relaxed">
                  Apple does not support APK files. Instead, install directly in Safari in 3 taps:
                </p>
                <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-[#e9e5dc]">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f7f3eb] font-bold grid place-items-center text-[#073f3a]">1</span>
                    <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-[#007aff]" /> in Safari toolbar.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f7f3eb] font-bold grid place-items-center text-[#073f3a]">2</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline" />.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f7f3eb] font-bold grid place-items-center text-[#073f3a]">3</span>
                    <span>Tap <strong>Add</strong> at the top right.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DESKTOP */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                <p className="text-[#6f7d79] leading-relaxed">
                  Install on Windows, Mac, or ChromeOS with zero installation files:
                </p>
                <div className="bg-white p-4 rounded-2xl border border-[#e9e5dc] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🖥️</span>
                    <span>Click the <strong>Install icon</strong> in Chrome/Edge address bar (top-right next to bookmark star).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚀</span>
                    <span>Launches in its own distraction-free desktop window with taskbar pin support.</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModalInfo(false)}
              className="w-full rounded-2xl bg-[#073f3a] text-white text-xs font-bold py-3 hover:bg-[#063430] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

