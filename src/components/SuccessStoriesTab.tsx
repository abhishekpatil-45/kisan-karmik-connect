
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string | null;
    role: string | null;
  } | null;
  reviewee: {
    full_name: string | null;
    role: string | null;
  } | null;
};

const SuccessStoriesTab = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            full_name,
            role
          ),
          reviewee:reviewee_id (
            full_name,
            role
          )
        `)
        .gte('rating', 4)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch success stories.',
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading success stories...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No success stories yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Positive reviews from completed jobs will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Success Stories</h3>
        <p className="text-gray-600">
          Real reviews from farmers and laborers who found success through AGRISAMADHANA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {review.reviewer?.full_name || 'Anonymous'}
                    </CardTitle>
                    <p className="text-xs text-gray-500 capitalize">
                      {review.reviewer?.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <blockquote className="text-sm text-gray-700 italic mb-3">
                "{review.comment}"
              </blockquote>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>About:</span>
                  <span className="font-medium">
                    {review.reviewee?.full_name || 'Anonymous'}
                  </span>
                  <span className="capitalize">
                    ({review.reviewee?.role})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuccessStoriesTab;
