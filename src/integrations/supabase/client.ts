
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yrrzazxxromdfhgqypjg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlycnphenh4cm9tZGZoZ3F5cGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTg5MzAsImV4cCI6MjA2Mjc5NDkzMH0.19GilHLT16HjG3KfRulfLLS1Nlb3Z8-M-bmdccGu8jc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
