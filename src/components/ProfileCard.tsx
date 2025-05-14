
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Star } from "lucide-react";

interface ProfileCardProps {
  name: string;
  location: string;
  image: string;
  role: 'farmer' | 'laborer';
  skills?: string[];
  crops?: string[];
  rating?: number;
  experience?: number;
  onConnect?: () => void;
  onMessage?: () => void;
}

const ProfileCard = ({
  name,
  location,
  image,
  role,
  skills = [],
  crops = [],
  rating = 0,
  experience = 0,
  onConnect,
  onMessage
}: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className={`h-3 ${role === 'farmer' ? 'bg-primary-500' : 'bg-accent-500'}`}></div>
      <CardHeader className="p-4 flex flex-row items-start gap-4">
        <div className="relative">
          <img 
            src={image} 
            alt={name}
            className="rounded-full h-16 w-16 object-cover"
          />
          <Badge className={`absolute -bottom-1 -right-1 ${role === 'farmer' ? 'bg-primary-500' : 'bg-accent-500'}`}>
            {role === 'farmer' ? 'Farmer' : 'Laborer'}
          </Badge>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="text-sm text-gray-500">{location}</div>
          
          {rating > 0 && (
            <div className="flex items-center mt-1">
              {Array(5).fill(0).map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} 
                />
              ))}
              <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {role === 'laborer' && experience > 0 && (
          <div className="mb-3">
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              {experience}+ Years Experience
            </Badge>
          </div>
        )}
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">{role === 'farmer' ? 'Growing:' : 'Expertise:'}</div>
          <div className="flex flex-wrap gap-1">
            {(role === 'farmer' ? crops : skills).map((item, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100">
                {item}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2 mt-3">
          {onConnect && (
            <Button 
              variant="default" 
              className="flex-1"
              onClick={onConnect}
            >
              Connect
            </Button>
          )}
          
          {onMessage && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onMessage}
            >
              <MessageCircle size={16} className="mr-1" /> Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
