// Hardcoded restaurant and menu data — no database required for display

export type Restaurant = {
  id: number;
  name: string;
  description: string;
  image: string;
  category: "top" | "campus";
  rating: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  tags: string[];
  isOpen: boolean;
  address: string;
};

export type MenuItem = {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
};

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Item 7",
    description: "Premium Nigerian cuisine with a modern twist. Famous for their jollof rice and grilled chicken",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    category: "top",
    rating: 4.7,
    deliveryTimeMin: 25,
    deliveryTimeMax: 40,
    deliveryFee: 800,
    tags: ["Top Rated", "Fast Delivery"],
    isOpen: true,
    address: "Ring Road, Ibadan",
  },
  {
    id: 2,
    name: "Kilimanjaro",
    description: "Fast food and continental dishes. Known for shawarma, burgers, and quick bites",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    category: "top",
    rating: 4.5,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 600,
    tags: ["Fast Delivery", "Popular"],
    isOpen: true,
    address: "Dugbe, Ibadan",
  },
  {
    id: 3,
    name: "Chicken Republic",
    description: "Nigeria's favorite chicken restaurant. Crispy fried chicken, wraps, and sides",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    category: "top",
    rating: 4.3,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    deliveryFee: 500,
    tags: ["Fast Delivery"],
    isOpen: true,
    address: "Challenge, Ibadan",
  },
  {
    id: 4,
    name: "KFC",
    description: "Finger lickin' good! World-famous fried chicken, zinger burgers, and more",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
    category: "top",
    rating: 4.4,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 700,
    tags: ["Top Rated"],
    isOpen: true,
    address: "Bodija, Ibadan",
  },
  {
    id: 5,
    name: "Tasty Vine",
    description: "Campus favorite for affordable and tasty local dishes. Jollof, fried rice, and more",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    category: "campus",
    rating: 4.2,
    deliveryTimeMin: 10,
    deliveryTimeMax: 20,
    deliveryFee: 300,
    tags: ["Budget Friendly", "Campus"],
    isOpen: true,
    address: "University of Ibadan Campus",
  },
  {
    id: 6,
    name: "Marigold",
    description: "Healthy and hearty campus meals. Fresh ingredients, generous portions",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    category: "campus",
    rating: 4.0,
    deliveryTimeMin: 10,
    deliveryTimeMax: 25,
    deliveryFee: 250,
    tags: ["Campus", "Healthy"],
    isOpen: true,
    address: "UI Campus, Ibadan",
  },
  {
    id: 7,
    name: "Chills",
    description: "Cool vibes and great food. Smoothies, grills, and snacks for students",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    category: "campus",
    rating: 4.1,
    deliveryTimeMin: 10,
    deliveryTimeMax: 20,
    deliveryFee: 200,
    tags: ["Campus", "Snacks"],
    isOpen: true,
    address: "Agbowo, Ibadan",
  },
];

export const menuItems: MenuItem[] = [
  // Item 7
  { id: 101, restaurantId: 1, name: "Jollof Rice & Chicken", description: "Smoky jollof rice served with grilled chicken and coleslaw", price: 3500, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop", category: "Main", isAvailable: true, isPopular: true },
  { id: 102, restaurantId: 1, name: "Fried Rice Special", description: "Colorful fried rice with shrimp and mixed vegetables", price: 3800, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", category: "Main", isAvailable: true, isPopular: true },
  { id: 103, restaurantId: 1, name: "Pepper Soup", description: "Spicy goat meat pepper soup with yam", price: 4000, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", category: "Soups", isAvailable: true, isPopular: false },
  { id: 104, restaurantId: 1, name: "Chapman", description: "Refreshing Nigerian cocktail with citrus and bitters", price: 1200, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop", category: "Drinks", isAvailable: true, isPopular: false },
  { id: 105, restaurantId: 1, name: "Grilled Fish", description: "Whole tilapia grilled with pepper sauce and plantain", price: 5000, image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop", category: "Main", isAvailable: true, isPopular: true },
  // Kilimanjaro
  { id: 201, restaurantId: 2, name: "Shawarma", description: "Loaded chicken shawarma with fresh vegetables and special sauce", price: 2500, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop", category: "Wraps", isAvailable: true, isPopular: true },
  { id: 202, restaurantId: 2, name: "Beef Burger", description: "Juicy beef patty with cheese, lettuce, and tomato", price: 3000, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: true },
  { id: 203, restaurantId: 2, name: "Chicken Wings", description: "Crispy chicken wings with dipping sauce", price: 2800, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop", category: "Sides", isAvailable: true, isPopular: false },
  { id: 204, restaurantId: 2, name: "Meat Pie", description: "Flaky pastry filled with seasoned minced meat", price: 800, image: "https://images.unsplash.com/photo-1605669468723-aab1f0e1a33b?w=400&h=300&fit=crop", category: "Snacks", isAvailable: true, isPopular: false },
  // Chicken Republic
  { id: 301, restaurantId: 3, name: "Crunchy Chicken", description: "Golden crispy fried chicken pieces", price: 2200, image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop", category: "Chicken", isAvailable: true, isPopular: true },
  { id: 302, restaurantId: 3, name: "Chicken Wrap", description: "Grilled chicken wrap with salad and mayo", price: 1800, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", category: "Wraps", isAvailable: true, isPopular: false },
  { id: 303, restaurantId: 3, name: "Rice Bowl", description: "Rice with chicken and pepper sauce", price: 2000, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop", category: "Bowls", isAvailable: true, isPopular: true },
  { id: 304, restaurantId: 3, name: "Coleslaw", description: "Fresh creamy coleslaw side", price: 500, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop", category: "Sides", isAvailable: true, isPopular: false },
  // KFC
  { id: 401, restaurantId: 4, name: "Zinger Burger", description: "Spicy chicken fillet burger with lettuce and mayo", price: 3200, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: true },
  { id: 402, restaurantId: 4, name: "Bucket Meal", description: "8 pieces of original recipe chicken", price: 8500, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", category: "Chicken", isAvailable: true, isPopular: true },
  { id: 403, restaurantId: 4, name: "Fries", description: "Crispy golden french fries", price: 1000, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop", category: "Sides", isAvailable: true, isPopular: false },
  // Tasty Vine
  { id: 501, restaurantId: 5, name: "Amala & Ewedu", description: "Soft amala with ewedu and assorted meat", price: 1500, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop", category: "Local", isAvailable: true, isPopular: true },
  { id: 502, restaurantId: 5, name: "Pounded Yam & Egusi", description: "Smooth pounded yam with rich egusi soup", price: 1800, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", category: "Local", isAvailable: true, isPopular: true },
  { id: 503, restaurantId: 5, name: "Beans & Plantain", description: "Stewed beans with fried plantain", price: 1000, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", category: "Local", isAvailable: true, isPopular: false },
  // Marigold
  { id: 601, restaurantId: 6, name: "Salad Bowl", description: "Fresh garden salad with grilled chicken", price: 2000, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", category: "Healthy", isAvailable: true, isPopular: false },
  { id: 602, restaurantId: 6, name: "Jollof Spaghetti", description: "Spicy jollof spaghetti with chicken", price: 1500, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop", category: "Main", isAvailable: true, isPopular: true },
  { id: 603, restaurantId: 6, name: "Fruit Smoothie", description: "Blended fresh fruits with yogurt", price: 800, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop", category: "Drinks", isAvailable: true, isPopular: false },
  // Chills
  { id: 701, restaurantId: 7, name: "Suya", description: "Spicy grilled beef skewers with onions and tomato", price: 1500, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop", category: "Grills", isAvailable: true, isPopular: true },
  { id: 702, restaurantId: 7, name: "Chicken Grill", description: "Flame-grilled chicken with jollof rice", price: 2200, image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop", category: "Grills", isAvailable: true, isPopular: false },
  { id: 703, restaurantId: 7, name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate syrup and toppings", price: 1000, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop", category: "Desserts", isAvailable: true, isPopular: false },
];

export const popularMeals = menuItems
  .filter((m) => m.isPopular)
  .map((m) => ({
    ...m,
    restaurantName: restaurants.find((r) => r.id === m.restaurantId)?.name ?? "",
    deliveryTimeMin: restaurants.find((r) => r.id === m.restaurantId)?.deliveryTimeMin ?? 20,
    deliveryTimeMax: restaurants.find((r) => r.id === m.restaurantId)?.deliveryTimeMax ?? 40,
  }));