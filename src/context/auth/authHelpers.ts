
import { supabase } from '@/integrations/supabase/client';

export const hasValidCrops = (skills: any): boolean => {
  return skills && 
         typeof skills === 'object' && 
         !Array.isArray(skills) &&
         Array.isArray(skills.crops) && 
         skills.crops.length > 0;
};

export const checkProfileCompletion = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { isComplete: false, role: null };
    }

    if (!data) {
      return { isComplete: false, role: null };
    }

    // Profile is complete only if user has a role AND all required fields
    if (data.role === 'farmer') {
      const isComplete = !!(
        data.phone && 
        data.location && 
        hasValidCrops(data.skills)
      );
      return { isComplete, role: data.role };
    } else if (data.role === 'laborer') {
      const isComplete = !!(
        data.phone && 
        data.location && 
        hasValidCrops(data.skills)
      );
      return { isComplete, role: data.role };
    } else {
      // User has no role assigned, profile is incomplete
      return { isComplete: false, role: null };
    }
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return { isComplete: false, role: null };
  }
};

export const createUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Create a basic profile if none exists (excluding "not found" error)
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: null, // Role will be set during profile completion
        });
      
      if (createError) {
        console.error('Error creating profile:', createError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error checking user profile:', error);
    return null;
  }
};
