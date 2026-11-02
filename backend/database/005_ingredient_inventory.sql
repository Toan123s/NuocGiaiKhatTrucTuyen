CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('ml', 'gram', 'piece')),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  version INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_recipes (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (product_id, size, ingredient_id)
);

CREATE TABLE IF NOT EXISTS topping_recipes (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  topping_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (product_id, topping_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS order_ingredient_reservations (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, ingredient_id)
);

-- Compatibility recipes let existing products migrate without silently losing stock.
-- Replace these piece-based recipes with real ml/gram recipes for the project catalog.
DO $$
DECLARE p RECORD; s TEXT; t JSONB; ingredient_id TEXT;
BEGIN
  FOR p IN SELECT id, name, stock, sizes, toppings FROM products LOOP
    INSERT INTO ingredients (id, name, unit, stock)
    VALUES ('legacy-product-' || p.id, p.name, 'piece', p.stock)
    ON CONFLICT (id) DO NOTHING;
    FOR s IN SELECT jsonb_array_elements_text(
      COALESCE((SELECT jsonb_agg(x->>'name') FROM jsonb_array_elements(p.sizes) x), '[]'::jsonb)
    ) LOOP
      INSERT INTO product_recipes(product_id, size, ingredient_id, quantity)
      VALUES (p.id, s, 'legacy-product-' || p.id, 1)
      ON CONFLICT DO NOTHING;
    END LOOP;
    FOR t IN SELECT * FROM jsonb_array_elements(p.toppings) LOOP
      ingredient_id := 'legacy-topping-' || p.id || '-' || (t->>'id');
      INSERT INTO ingredients(id, name, unit, stock)
      VALUES (ingredient_id, p.name || ' - ' || (t->>'name'), 'piece', 1000000)
      ON CONFLICT (id) DO NOTHING;
      INSERT INTO topping_recipes(product_id, topping_id, ingredient_id, quantity)
      VALUES (p.id, t->>'id', ingredient_id, 1)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
