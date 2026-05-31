-- Fix product genders that were incorrectly defaulted to UNISEX in earlier seeds.
-- Patterns based on product name prefixes set by the seeder.

UPDATE merchandise_products SET gender = 'MALE'
WHERE name ILIKE '%male%' OR name ILIKE '[shs]%male%' OR name ILIKE '[college]%male%';

UPDATE merchandise_products SET gender = 'FEMALE'
WHERE name ILIKE '%female%' OR name ILIKE '[shs]%female%' OR name ILIKE '[college]%female%';
