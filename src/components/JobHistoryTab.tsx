
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, IndianRupee, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReviewModal from './ReviewModal';

type JobHistory = {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  completed_at: string | null;
  job: {
    title: string;
    description: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
    pay_rate: number | null;
    pay_type: string | null;
    crop_category: string | null;
    labor_type: string | null;
    farmer: {
      id: string;
      full_name: string | null;
    } | null;
  } | null;
};

const JobHistoryTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    revieweeId: string;
    revieweeName: string;
    jobId: string;
  }>({
    isOpen: false,
    revieweeId: '',
    revieweeName: '',
    jobId: '',
  });

  useEffect(() => {
    fetchJobHistory();
  }, [user]);

  const fetchJobHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:job_id (
            title,
            description,
            location,
            start_date,
            end_date,
            pay_rate,
            pay_type,
            crop_category,
            labor_type,
            farmer:farmer_id (
              id,
              full_name
            )
          )
        `)
        .eq('laborer_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setJobHistory(data || []);
    } catch (error) {
      console.error('Error fetching job history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch job history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleGiveReview = (farmerId: string, farmerName: string, jobId: string) => {
    setReviewModal({
      isOpen: true,
      revieweeId: farmerId,
      revieweeName: farmerName,
      jobId: jobId,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading job history...</div>;
  }

  if (jobHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No job history yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Your applied and completed jobs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobHistory.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {application.job?.title || 'Unknown Job'}
              </CardTitle>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {application.job?.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{application.job.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Applied: {formatDate(application.applied_at)}</span>
              </div>
              
              {application.job?.pay_rate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <IndianRupee className="h-4 w-4" />
                  <span>₹{application.job.pay_rate} ({application.job.pay_type})</span>
                </div>
              )}
              
              {application.completed_at && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Completed: {formatDate(application.completed_at)}</span>
                </div>
              )}
            </div>
            
            {application.job?.description && (
              <p className="text-gray-600 text-sm">{application.job.description}</p>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-sm">
                <span className="text-gray-500">Farmer: </span>
                <span className="font-medium">
                  {application.job?.farmer?.full_name || 'Unknown'}
                </span>
              </div>
              
              {application.status === 'completed' && application.job?.farmer && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGiveReview(
                    application.job!.farmer!.id,
                    application.job!.farmer!.full_name || 'Farmer',
                    application.job_id
                  )}
                  className="flex items-center gap-1"
                >
                  <Star className="h-4 w-4" />
                  Give Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        revieweeId={reviewModal.revieweeId}
        revieweeName={reviewModal.revieweeName}
        jobId={reviewModal.jobId}
      />
    </div>
  );
};

export default JobHistoryTab;
