
import React from 'react';
import { User, MapPin, Phone, Calendar, PencilIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileViewProps {
  profileData: any;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

const ProfileView = ({ profileData, isOwnProfile, onEditClick }: ProfileViewProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {profileData.full_name || 'User Profile'}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {profileData.role === 'farmer' ? 'Farmer' : 'Laborer'}
              </Badge>
            </div>
          </div>
          {isOwnProfile && (
            <Button
              onClick={onEditClick}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{profileData.phone}</span>
            </div>
          )}
          
          {profileData.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{profileData.location}</span>
            </div>
          )}
          
          {profileData.experience && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{profileData.experience} years experience</span>
            </div>
          )}
        </div>

        {/* Skills and Crops */}
        {profileData.skills && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {profileData.role === 'farmer' ? 'Crops Grown' : 'Crop Experience'}
            </h3>
            {profileData.skills.crops && Array.isArray(profileData.skills.crops) && (
              <div className="flex flex-wrap gap-2">
                {profileData.skills.crops.map((crop: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {crop}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {profileData.skills?.bio && (
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-gray-700">{profileData.skills.bio}</p>
          </div>
        )}

        {/* Role-specific information */}
        {profileData.role === 'farmer' && profileData.skills && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.skills.farm_size && (
              <div>
                <h4 className="font-medium">Farm Size</h4>
                <p className="text-gray-600">{profileData.skills.farm_size} acres</p>
              </div>
            )}
            {profileData.skills.farming_type && (
              <div>
                <h4 className="font-medium">Farming Type</h4>
                <p className="text-gray-600">{profileData.skills.farming_type}</p>
              </div>
            )}
          </div>
        )}

        {profileData.role === 'laborer' && profileData.skills && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.skills.availability && (
              <div>
                <h4 className="font-medium">Availability</h4>
                <p className="text-gray-600">{profileData.skills.availability}</p>
              </div>
            )}
            {profileData.skills.wage_expectation && (
              <div>
                <h4 className="font-medium">Wage Expectation</h4>
                <p className="text-gray-600">{profileData.skills.wage_expectation}</p>
              </div>
            )}
            {profileData.skills.will_relocate !== undefined && (
              <div>
                <h4 className="font-medium">Willing to Relocate</h4>
                <p className="text-gray-600">{profileData.skills.will_relocate ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileView;
