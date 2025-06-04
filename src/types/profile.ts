import { Json } from "@/integrations/supabase/types";

export interface FarmerSkills {
  crops?: string[];
  farming_type?: string;
  farm_size?: string;
  bio?: string;
  languages?: string[];
  [key: string]: Json | undefined;
}

export interface LaborerSkills {
  crops?: string[];
  availability?: string;
  will_relocate?: boolean;
  wage_expectation?: string;
  bio?: string;
  languages?: string[];
  work_types?: string[];
  [key: string]: Json | undefined;
}

// Type guard functions
export const isFarmerSkills = (skills: any): skills is FarmerSkills => {
  return skills !== null && !Array.isArray(skills);
};

export const isLaborerSkills = (skills: any): skills is LaborerSkills => {
  return skills !== null && !Array.isArray(skills);
};

export interface ProfileFormProps {
  user: any;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}