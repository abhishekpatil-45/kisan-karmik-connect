
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, IndianRupee, User, Briefcase, Sprout } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type JobCardProps = {
  job: {
    id: string;
    title: string;
    description: string | null;
    farmer_id: string;
    crop_category: string | null;
    labor_type: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
    pay_rate: number | null;
    pay_type: string | null;
    status: string | null;
    created_at: string;
    farmer: {
      id: string;
      full_name: string | null;
      phone: string | null;
      location: string | null;
    } | null;
  };
};

const JobCard = ({ job }: JobCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to apply for jobs.',
        variant: 'destructive',
      });
      return;
    }

    setIsApplying(true);
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          laborer_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Application submitted!',
        description: 'Your application has been sent to the farmer.',
      });
    } catch (error: any) {
      console.error('Error applying for job:', error);
      if (error.code === '23505') {
        toast({
          title: 'Already applied',
          description: 'You have already applied for this job.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to apply for job. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-900">{job.title}</CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {job.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(job.start_date)}</span>
          </div>
          
          {job.pay_rate && (
            <div className="flex items-center gap-2 text-gray-600">
              <IndianRupee className="h-4 w-4" />
              <span>₹{job.pay_rate} ({job.pay_type})</span>
            </div>
          )}
          
          {job.crop_category && (
            <div className="flex items-center gap-2 text-gray-600">
              <Sprout className="h-4 w-4" />
              <span className="capitalize">{job.crop_category}</span>
            </div>
          )}
          
          {job.labor_type && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Briefcase className="h-4 w-4" />
              <span className="capitalize">{job.labor_type.replace('_', ' ')}</span>
            </div>
          )}
        </div>
        
        {job.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
        )}
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Posted by:</span>
          </div>
          <div className="text-sm">
            <p className="font-medium">{job.farmer?.full_name || 'Unknown farmer'}</p>
            {job.farmer?.phone && (
              <p className="text-gray-500">{job.farmer.phone}</p>
            )}
            {job.farmer?.location && (
              <p className="text-gray-500">{job.farmer.location}</p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleApply}
          disabled={isApplying || job.farmer_id === user?.id}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isApplying ? 'Applying...' : 'Apply for Job'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
