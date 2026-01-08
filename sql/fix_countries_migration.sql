-- Migration to add updated_at column to country_bank_details table
-- Run this if the table already exists and you don't want to recreate it

-- Add updated_at column
ALTER TABLE public.country_bank_details 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing records to have current timestamp
UPDATE public.country_bank_details 
SET updated_at = timezone('utc'::text, now()) 
WHERE updated_at IS NULL;