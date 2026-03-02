import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Palette, 
  Eye, 
  Music, 
  Heart, 
  Sparkles, 
  Sun, 
  Moon,
  Zap,
  Globe,
  Star
} from "lucide-react";

interface AfrocentricDesignSystemProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AfrocentricDesignSystem({ isVisible, onClose }: AfrocentricDesignSystemProps) {
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'patterns' | 'cultural'>('colors');

  const colorPalette = [
    {
      name: 'Crys Gold',
      hex: '#d4af37',
      description: 'Primary brand color representing innovation, prestige, and African excellence',
      usage: 'CTAs, highlights, active states, success indicators'
    },
    {
      name: 'Deep Black',
      hex: '#0a0a0a',
      description: 'Authority and depth, representing the richness of African heritage',
      usage: 'Backgrounds, text, professional depth'
    },
    {
      name: 'Pure White',
      hex: '#ffffff',
      description: 'Clarity and honesty, representing transparency in our process',
      usage: 'Text on dark backgrounds, clean interfaces'
    },
    {
      name: 'Charcoal',
      hex: '#1a1a1a',
      description: 'Secondary backgrounds with warmth and sophistication',
      usage: 'Cards, panels, secondary backgrounds'
    },
    {
      name: 'Graphite',
      hex: '#2a2a2a',
      description: 'UI elements that maintain professional audio aesthetics',
      usage: 'Borders, input fields, disabled states'
    }
  ];

  const culturalElements = [
    {
      name: 'Golden Ratio Spacing',
      description: 'Using 1.618 ratio in layouts, reflecting mathematical harmony found in African art',
      example: 'Margins, padding, component relationships'
    },
    {
      name: 'Rhythmic Typography',
      description: 'Type hierarchy that mirrors African musical patterns and rhythms',
      example: 'Heading scales, line heights, text flow'
    },
    {
      name: 'Warm Minimalism',
      description: 'Clean interfaces with subtle warmth, avoiding cold sterility',
      example: 'Card designs, button treatments, spacing'
    },
    {
      name: 'Cultural Color Psychology',
      description: 'Colors that resonate with African cultural meanings and modern aesthetics',
      example: 'Gold for excellence, black for strength, earth tones for grounding'
    },
    {
      name: 'Audio-First Design',
      description: 'Visual language that speaks to music producers and audio professionals',
      example: 'Signal flow visualizations, audio control aesthetics'
    }
  ];

  const typographySystem = [
    {
      element: 'h1',
      size: '2xl-4xl',
      weight: 'medium',
      usage: 'Page titles, hero headers',
      cultural: 'Bold presence reflecting confidence'
    },
    {
      element: 'h2',
      size: 'xl-2xl',
      weight: 'medium',
      usage: 'Section headers, card titles',
      cultural: 'Clear hierarchy with approachable tone'
    },
    {
      element: 'body',
      size: 'base',
      weight: 'normal',
      usage: 'Main content, descriptions',
      cultural: 'Readable, warm, accessible'
    },
    {
      element: 'labels',
      size: 'sm',
      weight: 'medium',
      usage: 'Form labels, UI guidance',
      cultural: 'Clear direction with authority'
    },
    {
      element: 'mono',
      size: 'sm',
      weight: 'normal',
      usage: 'Technical values, code',
      cultural: 'Professional audio precision'
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-crys-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-crys-gold" />
                Afrocentric Design System
              </CardTitle>
              <p className="text-crys-light-grey text-sm mt-1">
                Modern African aesthetic with cultural resonance and professional sophistication
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
            >
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Navigation */}
          <div className="flex space-x-1 bg-crys-graphite/30 p-1 rounded-lg">
            {[
              { id: 'colors', label: 'Color Palette', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Eye },
              { id: 'patterns', label: 'Design Patterns', icon: Sparkles },
              { id: 'cultural', label: 'Cultural Elements', icon: Heart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === tab.id
                    ? 'bg-crys-gold text-crys-black'
                    : 'text-crys-light-grey hover:text-crys-white hover:bg-crys-graphite/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Color Palette Section */}
          {activeSection === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-crys-white text-lg font-semibold mb-4">Brand Color System</h3>
                <div className="grid gap-4">
                  {colorPalette.map((color, index) => (
                    <Card key={index} className="bg-crys-graphite/30 border-crys-graphite">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-crys-gold/30 flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-crys-white font-medium">{color.name}</h4>
                              <code className="text-crys-gold bg-crys-black/30 px-2 py-1 rounded text-xs mono-font">
                                {color.hex}
                              </code>
                            </div>
                            <p className="text-crys-light-grey text-sm mb-2">{color.description}</p>
                            <div className="text-xs text-crys-gold">
                              <strong>Usage:</strong> {color.usage}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Color Usage Examples */}
              <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <Sun className="w-5 h-5 text-crys-gold" />
                    Cultural Color Significance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="text-crys-white font-medium mb-2">Gold (#d4af37)</h5>
                      <ul className="space-y-1 text-crys-light-grey">
                        <li>• Excellence and achievement in African traditions</li>
                        <li>• Wealth and prosperity symbolism</li>
                        <li>• Innovation and forward-thinking</li>
                        <li>• Premium quality and craftsmanship</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-crys-white font-medium mb-2">Black (#0a0a0a)</h5>
                      <ul className="space-y-1 text-crys-light-grey">
                        <li>• Strength and resilience</li>
                        <li>• Professional authority</li>
                        <li>• Depth and sophistication</li>
                        <li>• Cultural pride and identity</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Typography Section */}
          {activeSection === 'typography' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-crys-white text-lg font-semibold mb-4">Typography System</h3>
                <div className="grid gap-4">
                  {typographySystem.map((type, index) => (
                    <Card key={index} className="bg-crys-graphite/30 border-crys-graphite">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                                {type.element}
                              </Badge>
                              <code className="text-crys-light-grey text-xs">{type.size}</code>
                              <code className="text-crys-light-grey text-xs">{type.weight}</code>
                            </div>
                            <p className="text-crys-light-grey text-sm mb-1">{type.usage}</p>
                            <p className="text-crys-gold text-xs">{type.cultural}</p>
                          </div>
                          <div className="text-right">
                            <div 
                              className={`text-crys-white ${
                                type.element === 'h1' ? 'text-2xl' :
                                type.element === 'h2' ? 'text-xl' :
                                type.element === 'body' ? 'text-base' :
                                type.element === 'labels' ? 'text-sm font-medium' :
                                'text-sm mono-font'
                              }`}
                            >
                              Sample Text
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Design Patterns Section */}
          {activeSection === 'patterns' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-crys-white text-lg font-semibold mb-4">Design Patterns</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card Example */}
                  <Card className="bg-crys-graphite/30 border-crys-graphite">
                    <CardHeader>
                      <CardTitle className="text-crys-white text-sm">Afrocentric Card Pattern</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-crys-gold" />
                          </div>
                          <div>
                            <h4 className="text-crys-white font-medium">Afrobeats Master</h4>
                            <p className="text-crys-light-grey text-sm">Professional quality</p>
                          </div>
                        </div>
                        <Badge className="bg-crys-gold/20 text-crys-gold">Premium</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Button Examples */}
                  <Card className="bg-crys-graphite/30 border-crys-graphite">
                    <CardHeader>
                      <CardTitle className="text-crys-white text-sm">Button Patterns</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black w-full">
                        Primary Action
                      </Button>
                      <Button variant="outline" className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 w-full">
                        Secondary Action
                      </Button>
                      <Button variant="ghost" className="text-crys-light-grey hover:text-crys-white w-full">
                        Tertiary Action
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Audio Controls Pattern */}
                  <Card className="bg-crys-graphite/30 border-crys-graphite">
                    <CardHeader>
                      <CardTitle className="text-crys-white text-sm">Audio Interface Pattern</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-crys-gold/20 rounded flex items-center justify-center">
                            <Zap className="w-3 h-3 text-crys-gold" />
                          </div>
                          <span className="text-crys-white text-sm mono-font">-12.5 dB</span>
                        </div>
                        <div className="w-full h-2 bg-crys-graphite rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-crys-gold rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Indicators */}
                  <Card className="bg-crys-graphite/30 border-crys-graphite">
                    <CardHeader>
                      <CardTitle className="text-crys-white text-sm">Status Patterns</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-crys-white text-sm">Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-crys-gold rounded-full pulse-gold"></div>
                        <span className="text-crys-white text-sm">Processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-crys-white text-sm">Error</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Cultural Elements Section */}
          {activeSection === 'cultural' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-crys-white text-lg font-semibold mb-4">Cultural Design Elements</h3>
                <div className="grid gap-4">
                  {culturalElements.map((element, index) => (
                    <Card key={index} className="bg-crys-graphite/30 border-crys-graphite">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 text-crys-gold" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-crys-white font-medium mb-2">{element.name}</h4>
                            <p className="text-crys-light-grey text-sm mb-2">{element.description}</p>
                            <div className="text-xs text-crys-gold">
                              <strong>Implementation:</strong> {element.example}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Design Philosophy */}
              <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-crys-gold" />
                    Design Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h5 className="text-crys-white font-medium mb-2">African Excellence</h5>
                      <p className="text-crys-light-grey">
                        Every interface element reflects the excellence and innovation found throughout African culture, 
                        from ancient mathematical principles to modern creative expression.
                      </p>
                    </div>
                    <div>
                      <h5 className="text-crys-white font-medium mb-2">Professional Warmth</h5>
                      <p className="text-crys-light-grey">
                        Balancing professional audio industry standards with the warmth and approachability 
                        that characterizes African hospitality and community.
                      </p>
                    </div>
                    <div>
                      <h5 className="text-crys-white font-medium mb-2">Cultural Resonance</h5>
                      <p className="text-crys-light-grey">
                        Design decisions that honor African aesthetic traditions while creating 
                        a modern, globally competitive user experience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}