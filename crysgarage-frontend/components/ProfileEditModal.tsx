import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Save,
  X,
  Edit3,
  Upload,
  Camera
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
  tier: string;
  joinDate: string;
  totalTracks: number;
  totalSpent: number;
  isSignedIn: boolean;
}

interface ProfileEditModalProps {
  userData: UserData;
  onSave: (updatedData: UserData) => void;
  onClose: () => void;
}

export function ProfileEditModal({ userData, onSave, onClose }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: '+1 (555) 123-4567',
    company: 'Independent Artist',
    location: 'Los Angeles, CA',
    bio: 'Music producer and audio engineer specializing in Afrobeats and Hip-Hop. Passionate about creating professional quality masters for artists worldwide.',
    website: 'https://alexproducer.com',
    instagram: '@alexproducer',
    twitter: '@alexproducer'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user data with new name and email
    const updatedUserData = {
      ...userData,
      name: formData.name,
      email: formData.email
    };

    onSave(updatedUserData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-crys-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-crys-gold" />
                Edit Profile
              </CardTitle>
              <p className="text-crys-light-grey text-sm mt-1">
                Update your personal information and preferences
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-crys-gold/20 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-crys-gold" />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-crys-gold hover:bg-crys-gold-muted rounded-full flex items-center justify-center transition-colors">
                <Camera className="w-4 h-4 text-crys-black" />
              </button>
            </div>
            <p className="text-crys-light-grey text-sm">Click to upload profile picture</p>
          </div>

          <Separator className="bg-crys-graphite" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-crys-white font-medium mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-crys-white">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-crys-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-crys-white">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-crys-white">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-crys-white font-medium mb-4">Professional Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-crys-white">Company/Artist Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-crys-white">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-crys-graphite/30 border-crys-graphite text-crys-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="bio" className="text-crys-white">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 bg-crys-graphite/30 border border-crys-graphite rounded-lg text-crys-white resize-none"
                  rows={3}
                  placeholder="Tell us about your music and production style..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-crys-white font-medium mb-4">Social Links</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-crys-white">Instagram</Label>
                  <Input
                    id="instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="bg-crys-graphite/30 border-crys-graphite text-crys-white"
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-crys-white">Twitter/X</Label>
                  <Input
                    id="twitter"
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    className="bg-crys-graphite/30 border-crys-graphite text-crys-white"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            {/* Account Tier Info */}
            <div className="bg-crys-gold/5 border border-crys-gold/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-crys-white font-medium">Account Information</h4>
                  <p className="text-crys-light-grey text-sm">Member since {userData.joinDate}</p>
                </div>
                <Badge className="bg-crys-gold/20 text-crys-gold">
                  {userData.tier.charAt(0).toUpperCase() + userData.tier.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
                <Save className="w-4 h-4 ml-2" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}