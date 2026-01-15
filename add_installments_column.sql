-- Add allow_installments column to store_features
ALTER TABLE public.store_features 
ADD COLUMN IF NOT EXISTS allow_installments BOOLEAN DEFAULT FALSE;

-- Update existing features to allow installments by default if price is high (optional)
-- UPDATE public.store_features SET allow_installments = TRUE WHERE price_xof > 50000;
