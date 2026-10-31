import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Car,
  Train,
  Bus,
  Compass,
  ArrowRight,
  Info,
  DollarSign,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';

export const TransportGuidePage: React.FC = () => {
  const { pageParams, navigateTo } = useAuth();
  const [activeTab, setActiveTab] = useState<'tng' | 'grab' | 'transit'>(
    pageParams?.tab || 'tng'
  );

  // FAQ open toggles for TNG
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq((curr) => (curr === idx ? null : idx));
  };

  const tngFaqs = [
    {
      q: 'Can I use Touch \'n Go eWallet QR code at all LRT and MRT gates?',
      a: 'Yes, designated QR reader gantries are installed at all Rapid KL MRT, LRT, and Monorail stations. Look for turnstiles marked with the digital scanner icon. However, for KTM Komuter trains and buses, a physical Touch \'n Go card is still standard and most reliable.',
    },
    {
      q: 'Can international students and tourists register for Touch \'n Go eWallet?',
      a: 'Yes! International visitors and students can sign up using an active passport and a Malaysian mobile phone number (or roaming number that receives SMS OTPs). Completing eKYC (identity verification) by photographing your passport unlocks higher wallet tiers and DuitNow QR transfers.',
    },
    {
      q: 'What is the difference between an NFC Touch \'n Go Card and the eWallet app?',
      a: 'A physical NFC Touch \'n Go Card is a contactless smartcard that you tap directly on transit gates. If you purchase the newer "Enhanced Touch \'n Go Card" with NFC, you can reload the physical card directly by tapping it on the back of your smartphone inside the eWallet app!',
    },
    {
      q: 'How do I add money into Touch \'n Go eWallet?',
      a: 'You can reload funds instantly using Malaysian online banking (FPX), debit/credit cards (Visa/Mastercard), DuitNow transfers from any local bank, or by purchasing cash reload PIN slips at convenience stores like 7-Eleven and 99 Speedmart.',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <span className="text-xs font-bold text-[#398077] uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Train className="w-3.5 h-3.5 text-[#073f3a]" />
          <span>Transportation & Cashless Payment Guides</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172b2a] tracking-tight">
          Getting Around Malaysia
        </h1>
        <p className="text-xs sm:text-sm text-[#6f7d79] mt-1 max-w-2xl">
          Everything you need to navigate public transit, master Touch 'n Go payments, and book safe ride-hailing trips with Grab.
        </p>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-[#e9e5dc] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tng')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tng'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <Smartphone className="w-4 h-4 text-[#073f3a]" />
          <span>Touch 'n Go eWallet Tutorial</span>
        </button>

        <button
          onClick={() => setActiveTab('grab')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'grab'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <Car className="w-4 h-4 text-[#20bf6b]" />
          <span>Grab Booking Tutorial</span>
        </button>

        <button
          onClick={() => setActiveTab('transit')}
          className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'transit'
              ? 'border-[#073f3a] text-[#073f3a]'
              : 'border-transparent text-[#6f7d79] hover:text-[#172b2a]'
          }`}
        >
          <Train className="w-4 h-4 text-[#0984e3]" />
          <span>Public Transit Network (MRT / LRT)</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: TOUCH 'N GO EWALLET TUTORIAL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'tng' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Overview Hero Banner */}
          <div className="bg-[#073f3a] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="inline-block bg-white/20 text-[#ffeb9a] text-xs font-bold px-3 py-1 rounded-full">
                Cashless Essentials
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                What is Touch 'n Go eWallet?
              </h2>
              <p className="text-xs sm:text-sm text-[#d4e7df] leading-relaxed">
                Touch 'n Go (TNG) eWallet is Malaysia’s premier digital payment app. It enables QR code payments at hawker stalls, mamaks, supermarkets, and toll booths, plus transit entry at Rapid KL rail networks.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="https://www.touchngo.com.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#ffeb9a] hover:bg-[#ffe373] text-[#172b2a] text-xs font-bold px-5 py-2.5 rounded-full transition-all inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>Official Touch 'n Go Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <span className="absolute -right-6 -bottom-10 text-9xl opacity-15 pointer-events-none select-none">
              📱
            </span>
          </div>

          {/* Critical Compatibility Notice */}
          <div className="bg-[#fff8e7] border border-[#f5dfa6] rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-[#8c6a13]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#e58e26] mt-0.5" />
            <div>
              <strong className="block font-bold text-sm text-[#7a590c] mb-1">
                Important: eWallet QR vs. Physical Transit Cards
              </strong>
              <span>
                eWallet QR payments and physical transit card taps are <strong>not interchangeable everywhere</strong>. While Rapid KL LRT and MRT gates now support eWallet QR, buses, toll roads, and KTM trains still strictly require a <strong>physical Touch 'n Go card</strong>. Always confirm operator compatibility below!
              </span>
            </div>
          </div>

          {/* 4 Step-by-Step Tutorial Cards */}
          <div>
            <h3 className="text-lg font-bold text-[#172b2a] mb-4 flex items-center gap-2">
              <span>Step-by-Step Setup Tutorial</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#073f3a] text-white font-extrabold text-sm grid place-items-center">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-[#172b2a]">Download & Register</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed mb-3">
                  Download “Touch 'n Go eWallet” from your mobile app store. Enter your mobile phone number, receive the SMS OTP verification code, and set a secure 6-digit payment PIN.
                </p>
                <div className="text-[11px] font-semibold text-[#073f3a] bg-[#f7f3eb] p-2.5 rounded-xl">
                  💡 <em>Student Tip:</em> Use your Malaysian SIM card so you never miss transactional OTP messages.
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#073f3a] text-white font-extrabold text-sm grid place-items-center">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-[#172b2a]">eKYC Verification (Passport)</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed mb-3">
                  Go to Profile → Verify Account. Select <strong>Passport</strong> (for non-Malaysians) or <strong>MyKad</strong> (for citizens). Take a clear photo of your identification and a selfie to unlock transfer and higher balance limits.
                </p>
                <div className="text-[11px] font-semibold text-[#073f3a] bg-[#f7f3eb] p-2.5 rounded-xl">
                  🔒 <em>Security:</em> Verified accounts are protected by Bank Negara Malaysia guidelines.
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#073f3a] text-white font-extrabold text-sm grid place-items-center">
                    3
                  </span>
                  <h4 className="font-bold text-sm text-[#172b2a]">Add Funds (Reload)</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed mb-3">
                  Tap “+ Reload” on the home screen. Choose <strong>Online Banking (FPX)</strong>, <strong>Debit / Credit Card</strong>, or <strong>DuitNow Transfer</strong> from your banking app. You can also buy cash reload vouchers at 7-Eleven.
                </p>
                <div className="text-[11px] font-semibold text-[#073f3a] bg-[#f7f3eb] p-2.5 rounded-xl">
                  ⚡ <em>Auto-Reload:</em> Enable Auto-Reload from a card so your balance never drops below RM 20!
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#073f3a] text-white font-extrabold text-sm grid place-items-center">
                    4
                  </span>
                  <h4 className="font-bold text-sm text-[#172b2a]">Scan & Pay Everywhere</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed mb-3">
                  Tap <strong>Scan</strong> to point your camera at merchant QR codes (supports any pink DuitNow QR stand!). Or tap <strong>Pay</strong> to generate your personal barcode for supermarket cashiers to scan.
                </p>
                <div className="text-[11px] font-semibold text-[#073f3a] bg-[#f7f3eb] p-2.5 rounded-xl">
                  🛒 <em>Universal:</em> Accepted at 95%+ of dining spots, campus marts, and convenience stores.
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Comparison Table */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#172b2a] mb-2">
              Comparison: TNG eWallet vs. Physical Card vs. Bank Card
            </h3>
            <p className="text-xs text-[#6f7d79] mb-4">
              Understanding which payment method to use for transportation and everyday spending.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e9e5dc] bg-[#faf8f3] text-[#172b2a]">
                    <th className="p-3 font-bold">Payment Method</th>
                    <th className="p-3 font-bold">Best For</th>
                    <th className="p-3 font-bold">LRT / MRT Support</th>
                    <th className="p-3 font-bold">Buses & KTM Support</th>
                    <th className="p-3 font-bold">Reload Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eee8] text-[#52615c]">
                  <tr>
                    <td className="p-3 font-bold text-[#172b2a] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#073f3a]" />
                      <span>Touch 'n Go eWallet (App)</span>
                    </td>
                    <td className="p-3">Food stalls, retail, bill payments, MRT QR gates</td>
                    <td className="p-3 text-[#28583d] font-semibold">✓ Supported at QR gates</td>
                    <td className="p-3 text-[#e58e26]">Limited / Physical card preferred</td>
                    <td className="p-3">Instant online via App / Cards</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#172b2a] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#ff5c7a]" />
                      <span>Enhanced NFC TNG Card</span>
                    </td>
                    <td className="p-3">All public transit (trains, buses), tolls, parking</td>
                    <td className="p-3 text-[#28583d] font-semibold">✓ All station gantries</td>
                    <td className="p-3 text-[#28583d] font-semibold">✓ Full support</td>
                    <td className="p-3">Tap to smartphone back via eWallet</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#172b2a] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#0984e3]" />
                      <span>Contactless Visa / Mastercard</span>
                    </td>
                    <td className="p-3">Shopping malls, restaurants, KLIA Ekspres train</td>
                    <td className="p-3 text-[#e58e26]">Rolling out gradually</td>
                    <td className="p-3 text-[#e58e26]">Pilot stages on selected buses</td>
                    <td className="p-3">Your issuing bank account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transit Operator Compatibility Matrix */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#172b2a] mb-3">
              Transit Operator Compatibility
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <div className="font-bold text-[#172b2a] mb-1">Rapid KL (MRT / LRT)</div>
                <div className="text-[#28583d] font-semibold">✓ Physical Card & eWallet QR</div>
                <p className="text-[11px] text-[#6f7d79] mt-1">Tap card or scan QR at dedicated gantries.</p>
              </div>

              <div className="p-3 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <div className="font-bold text-[#172b2a] mb-1">Rapid KL Feeder Buses</div>
                <div className="text-[#28583d] font-semibold">✓ Physical TNG Card (RM 1.00)</div>
                <p className="text-[11px] text-[#6f7d79] mt-1">Cash is not accepted on Rapid KL buses.</p>
              </div>

              <div className="p-3 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <div className="font-bold text-[#172b2a] mb-1">KTM Komuter</div>
                <div className="text-[#28583d] font-semibold">✓ Physical TNG Card / KTM Link</div>
                <p className="text-[11px] text-[#6f7d79] mt-1">Key line to Batu Caves and Mid Valley.</p>
              </div>

              <div className="p-3 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <div className="font-bold text-[#172b2a] mb-1">KLIA Transit / Ekspres</div>
                <div className="text-[#28583d] font-semibold">✓ TNG Card, Visa & Mastercard</div>
                <p className="text-[11px] text-[#6f7d79] mt-1">Direct airport rail connection from KL Sentral.</p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#172b2a] mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {tngFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-[#e9e5dc] rounded-2xl overflow-hidden transition-all">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-[#172b2a] bg-[#faf8f3] hover:bg-[#f0ece3] flex items-center justify-between gap-3"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#073f3a]" /> : <ChevronDown className="w-4 h-4 text-[#6f7d79]" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs text-[#52645b] leading-relaxed bg-white border-t border-[#e9e5dc]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: GRAB BOOKING TUTORIAL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'grab' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Grab Hero Banner */}
          <div className="bg-[#00b14f] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                Ride-Hailing Companion
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                How to Book a Ride Using Grab
              </h2>
              <p className="text-xs sm:text-sm text-[#e1fbe9] leading-relaxed">
                Grab is Southeast Asia’s leading super-app for ride-hailing and food delivery. Learn how to set pickup points, choose ride categories, track your driver, and travel safely across Malaysia.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="https://www.grab.com/my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#00b14f] text-xs font-bold px-6 py-2.5 rounded-full transition-all inline-flex items-center gap-1.5 shadow-sm hover:bg-[#f0ece3]"
                >
                  <span>Open Grab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <span className="absolute -right-6 -bottom-10 text-9xl opacity-15 pointer-events-none select-none">
              🚗
            </span>
          </div>

          {/* Grab Steps Grid */}
          <div>
            <h3 className="text-lg font-bold text-[#172b2a] mb-4">Step-by-Step Grab Tutorial</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00b14f] text-white font-extrabold text-sm grid place-items-center">1</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172b2a]">Download & Sign Up</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed">
                  Download Grab from your app store. Sign in using your email account or phone number. Enable location permissions for accurate GPS pickup.
                </p>
              </div>

              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00b14f] text-white font-extrabold text-sm grid place-items-center">2</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172b2a]">Set Pickup & Destination</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed">
                  Tap "Rides". Check your green pickup pin carefully (e.g. at shopping mall Lobby or Exit Door). Type your destination name or select on the map.
                </p>
              </div>

              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00b14f] text-white font-extrabold text-sm grid place-items-center">3</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172b2a]">Choose Ride Tier</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed">
                  Select <strong>JustGrab</strong> (fastest nearby car/taxi), <strong>GrabCar</strong> (standard private car), or <strong>GrabCar 6-Seater</strong> if traveling with friends.
                </p>
              </div>

              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00b14f] text-white font-extrabold text-sm grid place-items-center">4</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172b2a]">Review Fare & Confirm</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed">
                  Grab shows fixed upfront fares before booking (excluding highway tolls). Pay via GrabPay, Credit Card, or Cash. Tap “Book JustGrab”.
                </p>
              </div>

              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00b14f] text-white font-extrabold text-sm grid place-items-center">5</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172b2a]">Track Driver & Chat</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed">
                  View driver name, car model, license plate, and estimated arrival time. You can send in-app messages or photos of where you are standing.
                </p>
              </div>

              <div className="bg-white border border-[#e9e5dc] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-[#00b14f] text-white font-extrabold text-sm grid place-items-center">6</span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172b2a]">Verify & Enjoy Ride</h4>
                </div>
                <p className="text-xs text-[#6f7d79] leading-relaxed">
                  Always confirm the car license plate and driver photo before boarding. Sit comfortably, buckle your seatbelt, and rate your trip afterwards.
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Safety Guide */}
          <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#172b2a] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#073f3a]" />
              <span>Passenger Safety Advice</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#52645b]">
              <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <strong className="block text-[#172b2a] font-bold mb-1">1. Share Ride Status</strong>
                Use Grab’s in-app “Share My Ride” feature to send live GPS tracking to friends or roommates via WhatsApp.
              </div>

              <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <strong className="block text-[#172b2a] font-bold mb-1">2. Verify License Plate</strong>
                Never enter an unmarked car. Match the car brand, color, and plate characters with the details displayed in the app.
              </div>

              <div className="p-4 bg-[#faf8f3] rounded-2xl border border-[#e9e5dc]">
                <strong className="block text-[#172b2a] font-bold mb-1">3. Emergency SOS</strong>
                The Grab app features a built-in Emergency Button that can alert police or your emergency contacts instantly if needed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: PUBLIC TRANSIT NETWORK (MRT / LRT) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'transit' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-[#073f3a] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
                Klang Valley Integrated Transit System (KVITS)
              </h2>
              <p className="text-xs sm:text-sm text-[#d4e7df] max-w-2xl leading-relaxed">
                Klang Valley's comprehensive rail network integrates KTM Komuter, Rapid KL (LRT, MRT, Monorail), and Express Rail Link (KLIA Ekspres/Transit) with seamless Touch 'n Go contactless fares.
              </p>
            </div>
            <button
              onClick={() => navigateTo('explore')}
              className="bg-[#20bf6b] hover:bg-[#1bb062] text-[#073f3a] font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm whitespace-nowrap flex items-center justify-center gap-2 transition-all self-start md:self-auto"
            >
              <Train className="w-4 h-4" />
              <span>Open Live Rail Map</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1e3799]" />
                <span>KTM Komuter (Lines 1 & 2)</span>
              </h3>
              <p className="text-xs text-[#6f7d79] leading-relaxed">
                Operated by KTMB. Line 1 runs <strong>Batu Caves - KL Sentral - Seremban</strong>. Line 2 runs <strong>Tanjung Malim - Rawang - Subang Jaya - Port Klang</strong>. Essential for Batu Caves and Mid Valley trips.
              </p>
            </div>

            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d63031]" />
                <span>Kelana Jaya LRT (Line 5)</span>
              </h3>
              <p className="text-xs text-[#6f7d79] leading-relaxed">
                Connects <strong>KLCC</strong> (Petronas Twin Towers), <strong>Pasar Seni</strong>, <strong>Masjid Jamek</strong>, <strong>KL Sentral</strong>, and <strong>Bangsar</strong>. Trains run every 2–4 minutes during peak hours.
              </p>
            </div>

            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#009432]" />
                <span>Kajang MRT (Line 9)</span>
              </h3>
              <p className="text-xs text-[#6f7d79] leading-relaxed">
                High-capacity underground & elevated line linking <strong>Bukit Bintang</strong>, <strong>TRX</strong>, <strong>Pasar Seni</strong>, <strong>Muzium Negara</strong>, and <strong>1 Utama (Bandar Utama)</strong>.
              </p>
            </div>

            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                <span>Putrajaya MRT (Line 12)</span>
              </h3>
              <p className="text-xs text-[#6f7d79] leading-relaxed">
                Direct link to <strong>Hospital KL (HKL)</strong>, <strong>Titiwangsa</strong>, <strong>Persiaran KLCC</strong>, <strong>TRX</strong>, <strong>Cyberjaya</strong>, and <strong>Putrajaya Sentral</strong>.
              </p>
            </div>

            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#84cc16]" />
                <span>Rapid KL Monorail (Line 8)</span>
              </h3>
              <p className="text-xs text-[#6f7d79] leading-relaxed">
                Elevated monorail threading through central shopping hubs: <strong>KL Sentral</strong>, <strong>Hang Tuah (LaLaport)</strong>, <strong>Imbi (Times Square)</strong>, <strong>Bukit Bintang</strong>, and <strong>Bukit Nanas</strong>.
              </p>
            </div>

            <div className="bg-white border border-[#e9e5dc] rounded-3xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-sm text-[#172b2a] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
                <span>KLIA Ekspres & Transit (Line 6/7)</span>
              </h3>
              <p className="text-xs text-[#6f7d79] leading-relaxed">
                Dedicated non-stop 28-minute airport express connecting <strong>KL Sentral City Air Terminal</strong> directly with <strong>KLIA Terminal 1 & 2</strong>, plus Transit stops at TBS and Putrajaya.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
