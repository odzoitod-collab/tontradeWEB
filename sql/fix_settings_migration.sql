-- Migration to add bank_details column to settings table
-- Run this if the table already exists and you don't want to recreate it

-- Add bank_details column
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS bank_details TEXT DEFAULT 'Реквизиты не указаны';

-- Update existing records to have default bank details
UPDATE public.settings 
SET bank_details = 'Реквизиты не указаны' 
WHERE bank_details IS NULL;