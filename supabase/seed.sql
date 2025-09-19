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
INSERT INTO recipes (title, description, cooking_time, difficulty, category, user_id, ingredients, instructions) VALUES 
  (
    'Creamy Pesto Pasta',
    'A delicious and creamy pesto pasta that''s perfect for a quick weeknight dinner.',
    15,
    'Easy',
    'Italian',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['8 oz pasta', '1/2 cup pesto', '1/4 cup heavy cream', '1/4 cup parmesan cheese', 'Salt and pepper to taste'],
    ARRAY['Cook pasta according to package directions', 'Drain pasta and return to pot', 'Add pesto and cream, mix well', 'Stir in parmesan cheese', 'Season with salt and pepper']
  ),
  (
    'Classic Shakshuka',
    'Middle Eastern eggs poached in a spicy tomato sauce with peppers and onions.',
    25,
    'Medium',
    'Middle Eastern',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['4 eggs', '1 can diced tomatoes', '1 bell pepper', '1 onion', '2 cloves garlic', '1 tsp cumin', '1 tsp paprika', 'Salt and pepper'],
    ARRAY['Sauté onions and peppers until soft', 'Add garlic and spices, cook 1 minute', 'Add tomatoes and simmer 10 minutes', 'Make wells in sauce and crack eggs', 'Cover and cook until eggs are set']
  ),
  (
    'Garlic Butter Salmon',
    'Perfectly seared salmon with a rich garlic butter sauce and fresh herbs.',
    20,
    'Easy',
    'Seafood',
    '33333333-3333-3333-3333-333333333333',
    ARRAY['2 salmon fillets', '4 tbsp butter', '4 cloves garlic', '2 tbsp lemon juice', 'Fresh dill', 'Salt and pepper'],
    ARRAY['Season salmon with salt and pepper', 'Heat pan over medium-high heat', 'Cook salmon 4-5 minutes per side', 'Add butter and garlic to pan', 'Add lemon juice and dill', 'Spoon sauce over salmon']
  ),
  (
    'Chocolate Chip Cookies',
    'Soft and chewy chocolate chip cookies that are perfect for any occasion.',
    30,
    'Easy',
    'Dessert',
    '44444444-4444-4444-4444-444444444444',
    ARRAY['2 1/4 cups flour', '1 tsp baking soda', '1 tsp salt', '1 cup butter', '3/4 cup brown sugar', '1/4 cup white sugar', '2 eggs', '2 cups chocolate chips'],
    ARRAY['Preheat oven to 375°F', 'Mix dry ingredients in bowl', 'Cream butter and sugars', 'Add eggs and vanilla', 'Mix in dry ingredients', 'Fold in chocolate chips', 'Bake 9-11 minutes']
  ),
  (
    'Thai Green Curry',
    'Authentic Thai green curry with coconut milk, vegetables, and your choice of protein.',
    35,
    'Medium',
    'Thai',
    '55555555-5555-5555-5555-555555555555',
    ARRAY['1 can coconut milk', '2 tbsp green curry paste', '1 lb protein (chicken/tofu)', '1 bell pepper', '1 eggplant', '1 tbsp fish sauce', '1 tbsp brown sugar', 'Basil leaves'],
    ARRAY['Heat curry paste in large pot', 'Add coconut milk and bring to simmer', 'Add protein and cook 10 minutes', 'Add vegetables and cook 5 minutes', 'Season with fish sauce and sugar', 'Garnish with basil']
  ),
  (
    'Mediterranean Quinoa Bowl',
    'Healthy quinoa bowl with roasted vegetables, feta cheese, and tahini dressing.',
    40,
    'Easy',
    'Mediterranean',
    '66666666-6666-6666-6666-666666666666',
    ARRAY['1 cup quinoa', '2 cups water', '1 zucchini', '1 bell pepper', '1 red onion', '1/2 cup feta cheese', '2 tbsp tahini', '2 tbsp lemon juice', 'Olive oil'],
    ARRAY['Cook quinoa according to package directions', 'Preheat oven to 400°F', 'Chop vegetables and toss with olive oil', 'Roast vegetables 20-25 minutes', 'Make tahini dressing', 'Assemble bowls with quinoa, vegetables, and feta', 'Drizzle with tahini dressing']
  );
