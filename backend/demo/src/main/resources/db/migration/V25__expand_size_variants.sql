-- V25: Expand grouped size-range variants into individual size variants,
-- update SHS Traditional Uniform products to use SHS category, and
-- add College Traditional Uniform products.
-- Each product that previously had "XS–3XL" as ONE variant now gets 7 separate
-- variants (XS, S, M, L, XL, 2XL, 3XL), one per size — matching the user-facing
-- size picker that lists individual sizes (XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL).
-- Reservations linked to old variants are cascaded-deleted (ON DELETE CASCADE).

DO $$
DECLARE
  v          RECORD;
  s          TEXT;
  std_sizes  TEXT[] := ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  ext_sizes  TEXT[] := ARRAY['4XL', '5XL', '6XL'];
  all_sizes  TEXT[] := ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  full_sizes TEXT[] := ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
  sizes      TEXT[];
  sku_base   TEXT;
  i          INT;
BEGIN

  -- ── Handle "XS–3XL" → 7 individual sizes ───────────────────────────────────
  FOR v IN
    SELECT * FROM product_variants WHERE size IN ('XS–3XL', 'XS-3XL', 'XS–3XL')
  LOOP
    sizes    := std_sizes;
    sku_base := regexp_replace(v.sku, '[-_]?(STD|XS.*3XL)$', '', 'i');
    i := 1;
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v.product_id,
        s,
        v.color,
        sku_base || '-' || REPLACE(s, 'XL', 'XL'),
        GREATEST(v.stock / array_length(sizes, 1), 2),
        v.price,
        v.active,
        v.created_at,
        v.updated_at
      );
      i := i + 1;
    END LOOP;
    DELETE FROM product_variants WHERE id = v.id;
  END LOOP;

  -- ── Handle "4XL–6XL" → 3 individual sizes ──────────────────────────────────
  FOR v IN
    SELECT * FROM product_variants WHERE size IN ('4XL–6XL', '4XL-6XL')
  LOOP
    sizes    := ext_sizes;
    sku_base := regexp_replace(v.sku, '[-_]?(EXT|4XL.*6XL)$', '', 'i');
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v.product_id,
        s,
        v.color,
        sku_base || '-' || s,
        GREATEST(v.stock / array_length(sizes, 1), 1),
        v.price,
        v.active,
        v.created_at,
        v.updated_at
      );
    END LOOP;
    DELETE FROM product_variants WHERE id = v.id;
  END LOOP;

  -- ── Handle "XS–4XL" → 8 individual sizes ───────────────────────────────────
  FOR v IN
    SELECT * FROM product_variants WHERE size IN ('XS–4XL', 'XS-4XL')
  LOOP
    sizes    := all_sizes;
    sku_base := regexp_replace(v.sku, '[-_]?(STD|XS.*4XL)$', '', 'i');
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v.product_id,
        s,
        v.color,
        sku_base || '-' || s,
        GREATEST(v.stock / array_length(sizes, 1), 2),
        v.price,
        v.active,
        v.created_at,
        v.updated_at
      );
    END LOOP;
    DELETE FROM product_variants WHERE id = v.id;
  END LOOP;

  -- ── Handle "XS–6XL" → 10 individual sizes ──────────────────────────────────
  FOR v IN
    SELECT * FROM product_variants WHERE size IN ('XS–6XL', 'XS-6XL')
  LOOP
    sizes    := full_sizes;
    sku_base := regexp_replace(v.sku, '[-_]?(STD|XS.*6XL)$', '', 'i');
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v.product_id,
        s,
        v.color,
        sku_base || '-' || s,
        GREATEST(v.stock / array_length(sizes, 1), 1),
        v.price,
        v.active,
        v.created_at,
        v.updated_at
      );
    END LOOP;
    DELETE FROM product_variants WHERE id = v.id;
  END LOOP;

END $$;

-- ── Update SHS Traditional Uniform products to use SHS category ────────────
UPDATE merchandise_products
SET category = 'SHS'
WHERE name LIKE '[SHS]%'
  AND category = 'CLOTHING';

-- ── Add College Traditional Uniform products (mirror of SHS at College level) ──
DO $$
DECLARE
  prod_id  UUID;
  std_sz   TEXT[] := ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  ext_sz   TEXT[] := ARRAY['4XL', '5XL', '6XL'];
  s        TEXT;
BEGIN
  -- Only insert if not already present (idempotent)
  IF NOT EXISTS (SELECT 1 FROM merchandise_products WHERE name = '[College] Traditional Uniform Male Polo') THEN

    -- Male Polo
    INSERT INTO merchandise_products (id, name, description, image_url, category, gender, active, limited, created_at, updated_at)
    VALUES (gen_random_uuid(), '[College] Traditional Uniform Male Polo',
      '[College] Official NU Laguna College Traditional Uniform male polo shirt.',
      NULL, 'CLOTHING', 'MALE', TRUE, FALSE, NOW(), NOW())
    RETURNING id INTO prod_id;
    FOREACH s IN ARRAY std_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, NULL, 'TRAD-COL-M-T-' || s, 3, 650.00, TRUE, NOW(), NOW());
    END LOOP;
    FOREACH s IN ARRAY ext_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, NULL, 'TRAD-COL-M-T-' || s, 1, 950.00, TRUE, NOW(), NOW());
    END LOOP;

    -- Male Pants
    INSERT INTO merchandise_products (id, name, description, image_url, category, gender, active, limited, created_at, updated_at)
    VALUES (gen_random_uuid(), '[College] Traditional Uniform Male Pants',
      '[College] Official NU Laguna College Traditional Uniform male pants. Color: Navy Blue.',
      NULL, 'CLOTHING', 'MALE', TRUE, FALSE, NOW(), NOW())
    RETURNING id INTO prod_id;
    FOREACH s IN ARRAY std_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, 'Navy Blue', 'TRAD-COL-M-B-' || s, 3, 550.00, TRUE, NOW(), NOW());
    END LOOP;
    FOREACH s IN ARRAY ext_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, 'Navy Blue', 'TRAD-COL-M-B-' || s, 1, 800.00, TRUE, NOW(), NOW());
    END LOOP;

    -- Female Blouse
    INSERT INTO merchandise_products (id, name, description, image_url, category, gender, active, limited, created_at, updated_at)
    VALUES (gen_random_uuid(), '[College] Traditional Uniform Female Blouse',
      '[College] Official NU Laguna College Traditional Uniform female blouse.',
      NULL, 'CLOTHING', 'FEMALE', TRUE, FALSE, NOW(), NOW())
    RETURNING id INTO prod_id;
    FOREACH s IN ARRAY std_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, NULL, 'TRAD-COL-F-T-' || s, 3, 650.00, TRUE, NOW(), NOW());
    END LOOP;
    FOREACH s IN ARRAY ext_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, NULL, 'TRAD-COL-F-T-' || s, 1, 950.00, TRUE, NOW(), NOW());
    END LOOP;

    -- Female Skirt
    INSERT INTO merchandise_products (id, name, description, image_url, category, gender, active, limited, created_at, updated_at)
    VALUES (gen_random_uuid(), '[College] Traditional Uniform Female Skirt',
      '[College] Official NU Laguna College Traditional Uniform female navy blue skirt.',
      NULL, 'CLOTHING', 'FEMALE', TRUE, FALSE, NOW(), NOW())
    RETURNING id INTO prod_id;
    FOREACH s IN ARRAY std_sz LOOP
      INSERT INTO product_variants (id, product_id, size, color, sku, stock, price, active, created_at, updated_at)
      VALUES (gen_random_uuid(), prod_id, s, 'Navy Blue', 'TRAD-COL-F-B-' || s, 3, 400.00, TRUE, NOW(), NOW());
    END LOOP;

  END IF;
END $$;
