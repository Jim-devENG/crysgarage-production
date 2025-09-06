import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Globe, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Music,
  Calendar,
  CreditCard,
  CheckCircle,
  Edit3,
  Save,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthenticationContext';
import authService from '../services/authentication';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.website || '',
    instagram: user?.instagram || '',
    twitter: user?.twitter || '',
    facebook: user?.facebook || '',
    youtube: user?.youtube || '',
    tiktok: user?.tiktok || '',
  });

  const isPaidTier = (tier: string | undefined) => tier === 'professional' || tier === 'advanced';
  const isRestricted = isPaidTier(user?.tier) && ((user?.credits ?? 0) <= 0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        instagram: user.instagram || '',
        twitter: user.twitter || '',
        facebook: user.facebook || '',
        youtube: user.youtube || '',
        tiktok: user.tiktok || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        instagram: user.instagram || '',
        twitter: user.twitter || '',
        facebook: user.facebook || '',
        youtube: user.youtube || '',
        tiktok: user.tiktok || '',
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'professional': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      default: return 'bg-crys-gold/20 text-crys-gold border-crys-gold/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl font-semibold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => onNavigate('login')} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('landing')}
              className="text-crys-light-grey hover:text-crys-white"
            >
              <X className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-crys-white">My Profile</h1>
              <p className="text-crys-light-grey">Manage your account and KYC information</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" className="border-crys-graphite text-crys-light-grey">Cancel</Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black">
                {isLoading ? (<><div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Changes</>)}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-crys-graphite bg-audio-panel-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-crys-white font-semibold">Billing & Wallet</div>
              <CreditCard className="w-4 h-4 text-crys-gold" />
            </div>
            <p className="text-sm text-crys-light-grey mb-3">Manage payment methods and view transactions</p>
            <Button onClick={() => onNavigate('billing')} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black w-full">Open Billing</Button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('successfully') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Restriction notice for paid tiers without credits */}
        {isRestricted && (
          <div className="p-4 mb-6 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 flex items-start gap-3">
            <Lock className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-semibold">Access Restricted</div>
              <div className="text-sm">Your current plan requires a successful payment before you can access the {user.tier} dashboard features.</div>
              <div className="mt-3">
                <Button onClick={() => onNavigate('billing')} className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black">
                  <CreditCard className="w-4 h-4 mr-2" /> Purchase Credits
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardHeader>
                <CardTitle className="text-crys-white flex items-center gap-2">
                  <User className="w-5 h-5 text-crys-gold" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-crys-gold" />
                  </div>
                  <div>
                    <h3 className="text-crys-white font-semibold">{user.name}</h3>
                    <p className="text-crys-light-grey text-sm">{user.email}</p>
                  </div>
                </div>

                <Separator className="bg-crys-graphite" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-crys-light-grey">Plan</span>
                    <Badge className={getTierColor(user.tier)}>
                      {user.tier ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1) : 'Free'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-crys-light-grey">Credits</span>
                    <span className="text-crys-white font-semibold">{user.credits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-crys-light-grey">Access</span>
                    {isRestricted ? (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/20">Restricted</Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/20">Active</Badge>
                    )}
                  </div>
                </div>

                {user.kyc_verified && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">KYC Verified</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardHeader>
                <CardTitle className="text-crys-white">Profile Information</CardTitle>
                <CardDescription className="text-crys-light-grey">Update your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-crys-white font-medium mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-crys-white">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-crys-white">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="email" type="email" value={formData.email} disabled={true} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-light-grey" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-crys-white">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-crys-white">Company/Artist Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="company" value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-crys-white">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-crys-white">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="website" type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-crys-graphite" />

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-crys-white">Bio</Label>
                  <textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} disabled={!isEditing} rows={3} className="w-full p-3 bg-crys-graphite border border-crys-charcoal rounded-lg text-crys-white resize-none mt-2" placeholder="Tell us about your music and production style..." />
                </div>

                <Separator className="bg-crys-graphite" />

                {/* Social Media */}
                <div>
                  <h3 className="text-crys-white font-medium mb-4">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-crys-white">Instagram</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="instagram" value={formData.instagram} onChange={(e) => handleInputChange('instagram', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" placeholder="@username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-crys-white">Twitter</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="twitter" value={formData.twitter} onChange={(e) => handleInputChange('twitter', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" placeholder="@username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-crys-white">Facebook</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="facebook" value={formData.facebook} onChange={(e) => handleInputChange('facebook', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" placeholder="facebook.com/username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube" className="text-crys-white">YouTube</Label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="youtube" value={formData.youtube} onChange={(e) => handleInputChange('youtube', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" placeholder="youtube.com/@username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="text-crys-white">TikTok</Label>
                      <div className="relative">
                        <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                        <Input id="tiktok" value={formData.tiktok} onChange={(e) => handleInputChange('tiktok', e.target.value)} disabled={!isEditing} className="pl-10 bg-crys-graphite border-crys-charcoal text-crys-white" placeholder="@username" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
