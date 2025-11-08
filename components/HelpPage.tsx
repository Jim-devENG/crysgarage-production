import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Mail, PlayCircle, Zap, Music, Settings, Star, BarChart3 } from 'lucide-react';

interface HelpPageProps {
  onGetStarted: () => void;
}

export function HelpPage({ onGetStarted }: HelpPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const contactOptions: Array<never> = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-black text-white">
      {/* Hero */}
      <div className="border-b border-crys-gold/15 bg-gradient-to-r from-crys-black/60 via-crys-graphite/30 to-crys-black/60 backdrop-blur">
        <div className="max-w-8xl mx-auto px-8 py-14 flex items-center justify-between gap-6">
          <div>
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-3">Help Center</Badge>
            <h1 className="text-4xl md:text-5xl font-bold">We're here to help</h1>
            <p className="text-crys-light-grey mt-3">Documentation, how‑tos and guidance for Crys Garage Studio.</p>
          </div>
          <div className="w-full max-w-md md:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-crys-light-grey" />
              <Input
                placeholder="Search help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-8xl mx-auto px-8 py-12 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 hidden lg:block">
          <div className="sticky top-24 space-y-2">
            {[{ id: 'overview', label: 'Overview' }, { id: 'getting-started', label: 'Getting Started' }, { id: 'tools', label: 'Free Tools' }, { id: 'faqs', label: 'FAQs' }, { id: 'contact', label: 'Contact' }].map(link => (
              <a key={link.id} href={`#${link.id}`} className="block px-4 py-2 rounded-lg text-sm text-crys-light-grey hover:text-crys-white hover:bg-crys-gold/10 border border-transparent hover:border-crys-gold/20 transition">
                {link.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <section className="col-span-12 lg:col-span-9 space-y-12">
          {/* Overview */}
          <div id="overview" className="space-y-4">
            <h2 className="text-2xl font-bold">Platform Overview</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader><CardTitle className="text-crys-white flex items-center gap-2"><Zap className="w-5 h-5 text-crys-gold" />Core Features</CardTitle></CardHeader>
                <CardContent className="text-crys-light-grey text-sm space-y-2">
                  <div>• AI-assisted mastering engine with genre presets</div>
                  <div>• Real-time preview (Professional/Advanced)</div>
                  <div>• LUFS/RMS/Peak metering (ITU-R BS.1770)</div>
                  <div>• True-peak limiting and format export</div>
                </CardContent>
              </Card>
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader><CardTitle className="text-crys-white flex items-center gap-2"><Settings className="w-5 h-5 text-crys-gold" />Tiers & Capabilities</CardTitle></CardHeader>
                <CardContent className="text-crys-light-grey text-sm space-y-2">
                  <div>• Free: Upload, instant master, paid download</div>
                  <div>• Professional: Real-time controls & analysis</div>
                  <div>• Advanced: Deep controls, live EQ/Comp/Limiter</div>
                  <div>• Normalizer & Analyzer: Free standalone tools</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Getting Started */}
          <div id="getting-started" className="space-y-4">
            <h2 className="text-2xl font-bold">Getting Started</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader><CardTitle className="text-crys-white flex items-center gap-2"><PlayCircle className="w-5 h-5 text-crys-gold" />Your First Master</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[ 'Choose your tier (Free/Professional/Advanced)', 'Upload your track (WAV/MP3/FLAC)', 'Select genre and options', 'Preview, then download your master' ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-crys-gold text-sm font-bold">{i + 1}</span></div>
                      <p className="text-crys-light-grey">{step}</p>
                    </div>
                  ))}
                  <Button onClick={onGetStarted} className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black w-full mt-2">Try It Now</Button>
                </CardContent>
              </Card>
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader><CardTitle className="text-crys-white flex items-center gap-2"><Star className="w-5 h-5 text-crys-gold" />Best Practices</CardTitle></CardHeader>
                <CardContent className="text-sm text-crys-light-grey space-y-2">
                  <div>• Upload quality audio (24-bit/44.1kHz+ for best results)</div>
                  <div>• Leave headroom (‑6 dB to ‑3 dB peaks)</div>
                  <div>• Choose the right genre for accurate processing</div>
                  <div>• Use reference tracks for tonal targets</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Free Tools */}
          <div id="tools" className="space-y-4">
            <h2 className="text-2xl font-bold">Free Professional Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader><CardTitle className="text-crys-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-crys-gold" />Audio Analyzer</CardTitle></CardHeader>
                <CardContent className="text-crys-light-grey text-sm space-y-2">
                  <div>• Integrated LUFS (ITU‑R BS.1770)</div>
                  <div>• Real-time frequency content (Bass/Mid/High)</div>
                  <div>• 3‑second meter hold, RMS & Peak</div>
                  <div>• Professional waveform view</div>
                </CardContent>
              </Card>
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader><CardTitle className="text-crys-white flex items-center gap-2"><Music className="w-5 h-5 text-crys-gold" />Audio Normalizer</CardTitle></CardHeader>
                <CardContent className="text-crys-light-grey text-sm space-y-2">
                  <div>• Target levels: ‑3 dB, ‑6 dB, ‑9 dB</div>
                  <div>• Peak‑safe gain with dynamic range respect</div>
                  <div>• Multiple format support</div>
                  <div>• Instant processing and download</div>
                </CardContent>
              </Card>
            </div>
          </div>

          


          {/* FAQs */}
          <div id="faqs" className="space-y-4">
            <h2 className="text-2xl font-bold">FAQs</h2>
            <div className="max-w-3xl space-y-3">
              {[
                { q: 'What files can I upload?', a: 'WAV, MP3, FLAC, M4A. We recommend WAV/FLAC for best quality.' },
                { q: 'How fast is mastering?', a: 'Usually under 2 minutes depending on length and tier.' },
                { q: 'Is the Analyzer accurate?', a: 'LUFS uses ITU‑R BS.1770; results align with professional meters.' },
                { q: 'How does payment work?', a: 'Free mastering; downloads require credits. Payments via secure gateway.' },
                { q: 'Can I use a reference track?', a: 'Yes, in the studio upload flow. It guides tone and loudness targets.' },
                { q: 'Where is my data stored?', a: 'Operational data in services/SQLite; users synced from Firebase.' },
                { q: 'Do I retain rights to my music?', a: 'Absolutely. You retain full rights and ownership of your audio.' },
                { q: 'Which browsers are supported?', a: 'Latest Chrome, Edge, Firefox, and Safari on desktop and mobile.' },
                { q: 'What are the Normalizer target levels?', a: 'Choose between −3 dB, −6 dB, and −9 dB for peak-safe output.' },
                { q: 'Can I cancel processing?', a: 'Yes, you can stop playback at any time and upload a new file.' },
                { q: 'Is there a limit on file size?', a: 'Yes, large files are supported up to the configured server limit.' },
                { q: 'Do I need an account to use the Free tier?', a: 'You can try tools freely; downloads may require an account for credits and receipts.' },
                { q: 'Can I get a refund on credits?', a: 'If there is a technical issue with delivery, contact support and we will assist.' },
                { q: 'What audio duration is supported?', a: 'Typical uploads up to several minutes are supported; extremely long files may be limited.' },
                { q: 'What formats do you export?', a: 'WAV and MP3 by default; other formats may be available based on tier.' },
                { q: 'Are my uploads private?', a: 'Yes. Files are processed securely and cleaned up automatically after a short time.' },
                { q: 'Difference between Professional and Advanced?', a: 'Professional adds real-time controls and analysis; Advanced gives deeper, studio-grade tweaking.' }
              ].map((item, idx) => (
                <details key={idx} className="bg-audio-panel-bg border-audio-panel-border rounded-lg">
                  <summary className="cursor-pointer list-none p-4 text-sm text-crys-white font-medium flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="text-crys-gold ml-4">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-crys-light-grey">{item.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div id="contact" className="space-y-8">
            <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-crys-white mb-4">Still need help?</h3>
                <p className="text-crys-light-grey mb-6">Our support team is standing by to help you get the most out of Crys Garage Studio.</p>
                <Button onClick={() => window.open('mailto:info@crysgarage.studio', '_blank')} variant="outline" className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"><Mail className="w-4 h-4 mr-2" />Send Email</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}