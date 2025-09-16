-- Insert sample profiles (these would normally be created by the auth trigger)
INSERT INTO profiles (id, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sarah Johnson'),
  ('22222222-2222-2222-2222-222222222222', 'Ahmed Hassan'),
  ('33333333-3333-3333-3333-333333333333', 'Maria Rodriguez'),
  ('44444444-4444-4444-4444-444444444444', 'David Chen'),
  ('55555555-5555-5555-5555-555555555555', 'Priya Patel'),
  ('66666666-6666-6666-6666-666666666666', 'Elena Kostas')
ON CONFLICT (id) DO NOTHING;

-- Insert sample recipes
INSERT INTO recipes (title, description, cook_time, difficulty, servings, image_url, tags, user_id) VALUES 
  (
    'Creamy Pesto Pasta',
    'A delicious and creamy pesto pasta that''s perfect for a quick weeknight dinner.',
    '15 mins',
    'Easy',
    4,
    '/api/placeholder/400/300',
    ARRAY['pasta', 'vegetarian', 'quick'],
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'Classic Shakshuka',
    'Middle Eastern eggs poached in a spicy tomato sauce with peppers and onions.',
    '25 mins',
    'Medium',
    2,
    '/api/placeholder/400/300',
    ARRAY['eggs', 'middle-eastern', 'breakfast'],
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'Garlic Butter Salmon',
    'Perfectly seared salmon with a rich garlic butter sauce and fresh herbs.',
    '20 mins',
    'Easy',
    2,
    '/api/placeholder/400/300',
    ARRAY['salmon', 'seafood', 'healthy'],
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'Chocolate Chip Cookies',
    'Soft and chewy chocolate chip cookies that are perfect for any occasion.',
    '30 mins',
    'Easy',
    24,
    '/api/placeholder/400/300',
    ARRAY['dessert', 'cookies', 'baking'],
    '44444444-4444-4444-4444-444444444444'
  ),
  (
    'Thai Green Curry',
    'Authentic Thai green curry with coconut milk, vegetables, and your choice of protein.',
    '35 mins',
    'Medium',
    4,
    '/api/placeholder/400/300',
    ARRAY['thai', 'curry', 'spicy'],
    '55555555-5555-5555-5555-555555555555'
  ),
  (
    'Mediterranean Quinoa Bowl',
    'Healthy quinoa bowl with roasted vegetables, feta cheese, and tahini dressing.',
    '40 mins',
    'Easy',
    2,
    '/api/placeholder/400/300',
    ARRAY['healthy', 'quinoa', 'mediterranean'],
    '66666666-6666-6666-6666-666666666666'
  );
