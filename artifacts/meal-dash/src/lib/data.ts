export type Restaurant = {
  id: number; name: string; description: string; image: string;
  category: "top" | "campus"; rating: number; deliveryTimeMin: number;
  deliveryTimeMax: number; deliveryFee: number; tags: string[];
  isOpen: boolean; address: string; cuisine?: string; minOrder?: number;
};

export type MenuItem = {
  id: number; restaurantId: number; name: string; description: string;
  price: number; image: string; category: string; isAvailable: boolean; isPopular: boolean;
};

export const restaurants: Restaurant[] = [
  { id: 1, name: "Item 7", description: "Premium Nigerian cuisine. Famous for party rice, shawarma and grilled chicken", image: "https://d3fphkxyf5o5bm.cloudfront.net/image-resize/format=webp,w=1200/Q524tReNnAnmuqp47hIEk9MgbKa7CFs0tCrjFwprP1", category: "top", rating: 4.7, deliveryTimeMin: 25, deliveryTimeMax: 40, deliveryFee: 800, tags: ["Top Rated", "Fast Delivery"], isOpen: true, address: "Ring Road, Ibadan", cuisine: "Nigerian", minOrder: 2000 },
  { id: 2, name: "Kilimanjaro", description: "Fast food and continental dishes. Known for shawarma, burgers, and quick bites", image: "https://dailytrust.com/wp-content/uploads/2023/07/Kilimanjaro.jpg", category: "top", rating: 4.5, deliveryTimeMin: 20, deliveryTimeMax: 35, deliveryFee: 600, tags: ["Fast Delivery", "Popular"], isOpen: true, address: "Dugbe, Ibadan", cuisine: "Continental", minOrder: 1500 },
  { id: 3, name: "Chicken Republic", description: "Nigeria's favorite chicken restaurant. Crispy fried chicken, wraps, and sides", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Chicken_Republic_Akure.jpg/330px-Chicken_Republic_Akure.jpg", category: "top", rating: 4.3, deliveryTimeMin: 15, deliveryTimeMax: 30, deliveryFee: 500, tags: ["Fast Delivery"], isOpen: true, address: "Challenge, Ibadan", cuisine: "Fast Food", minOrder: 1000 },
  { id: 4, name: "KFC", description: "Finger lickin' good! World-famous fried chicken, zinger burgers, and more", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop", category: "top", rating: 4.4, deliveryTimeMin: 20, deliveryTimeMax: 35, deliveryFee: 700, tags: ["Top Rated"], isOpen: true, address: "Bodija, Ibadan", cuisine: "Fast Food", minOrder: 2000 },
  { id: 8, name: "Burger King", description: "Home of the Whopper! Flame-grilled burgers, crispy fries, and signature sauces", image: "https://www.amrest.eu/sites/default/files/styles/730x756/public/2022-02/BurgerKing_restaurant%281%29.jpg?itok=e2wfUJ7f", category: "top", rating: 4.3, deliveryTimeMin: 20, deliveryTimeMax: 40, deliveryFee: 750, tags: ["Popular"], isOpen: true, address: "UI Road, Ibadan", cuisine: "Fast Food", minOrder: 2500 },
  { id: 9, name: "Cold Stone Creamery", description: "The ultimate ice cream experience! Premium ice cream made fresh daily with your choice of mix-ins", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&h=400&fit=crop", category: "top", rating: 4.6, deliveryTimeMin: 15, deliveryTimeMax: 30, deliveryFee: 500, tags: ["Top Rated", "Desserts"], isOpen: true, address: "Jericho, Ibadan", cuisine: "Desserts", minOrder: 1500 },
  { id: 5, name: "Tasty Vine", description: "Campus favorite for affordable and tasty local dishes. Jollof, fried rice, and more", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhoI7ozYin9-7iVc-klZsklh1YOXJ8-s1c8w&s", category: "campus", rating: 4.2, deliveryTimeMin: 10, deliveryTimeMax: 20, deliveryFee: 300, tags: ["Budget Friendly", "Campus"], isOpen: true, address: "University of Ibadan Campus", cuisine: "Nigerian", minOrder: 800 },
  { id: 6, name: "Marigold", description: "Healthy and hearty campus meals. Fresh ingredients, generous portions", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop", category: "campus", rating: 4.0, deliveryTimeMin: 10, deliveryTimeMax: 25, deliveryFee: 250, tags: ["Campus", "Healthy"], isOpen: true, address: "UI Campus, Ibadan", cuisine: "Healthy", minOrder: 700 },
  { id: 7, name: "Chills", description: "Cool vibes and great food. Smoothies, grills, and snacks for students", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop", category: "campus", rating: 4.1, deliveryTimeMin: 10, deliveryTimeMax: 20, deliveryFee: 200, tags: ["Campus", "Snacks"], isOpen: true, address: "Agbowo, Ibadan", cuisine: "Snacks", minOrder: 500 },
];

export const menuItems: MenuItem[] = [
  { id: 101, restaurantId: 1, name: "Jollof Rice & Chicken", description: "Smoky party jollof rice served with grilled chicken and coleslaw", price: 3500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVv7uBm3wF4BoX4vHT6O3hHPDP5tc1z_z5Q&s", category: "Main", isAvailable: true, isPopular: true },
  { id: 102, restaurantId: 1, name: "Fried Rice Special", description: "Colorful fried rice with shrimp and mixed vegetables", price: 3800, image: "https://i.ytimg.com/vi/Ql8h49eP-gA/maxresdefault.jpg", category: "Main", isAvailable: true, isPopular: true },
  { id: 103, restaurantId: 1, name: "Pepper Soup", description: "Spicy goat meat pepper soup with yam", price: 4000, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOgeyNQIGTv0OnPqqIsx4TxFQfvhPrtEpFzA&s", category: "Soups", isAvailable: true, isPopular: false },
  { id: 104, restaurantId: 1, name: "Chapman", description: "Refreshing Nigerian cocktail with citrus and bitters", price: 1200, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop", category: "Drinks", isAvailable: true, isPopular: false },
  { id: 105, restaurantId: 1, name: "Grilled Fish", description: "Whole tilapia grilled with pepper sauce and plantain", price: 5000, image: "https://i.ytimg.com/vi/3QiNnLX4C6k/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCIdIzHiySp_fcTHvx6GbjqDmYGhQ", category: "Main", isAvailable: true, isPopular: true },
  { id: 106, restaurantId: 1, name: "Shawarma", description: "Item 7 signature shawarma stuffed with grilled chicken", price: 2500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj24psxwdqELfKdMHjaqkmJiBldh0XpCF3_w&s", category: "Wraps", isAvailable: true, isPopular: true },
  { id: 201, restaurantId: 2, name: "Shawarma", description: "Loaded chicken shawarma with fresh vegetables and special sauce", price: 2500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn1_yshbB-qOSCKcRw5HqnDOhAjNXyQk_TQA&s", category: "Wraps", isAvailable: true, isPopular: true },
  { id: 202, restaurantId: 2, name: "Beef Burger", description: "Juicy beef patty with cheese, lettuce, and tomato", price: 3000, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: true },
  { id: 203, restaurantId: 2, name: "Chicken Wings", description: "Crispy chicken wings with dipping sauce", price: 2800, image: "https://d21klxpge3tttg.cloudfront.net/wp-content/uploads/2020/01/featured-honey-soy-chicken-wings-1024x640.jpg", category: "Sides", isAvailable: true, isPopular: false },
  { id: 204, restaurantId: 2, name: "Meat Pie", description: "Flaky pastry filled with seasoned minced meat and potatoes", price: 800, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT50xLz_vn6lbXCNE-Z-VB85hzZO-fx3pnFGA&s", category: "Snacks", isAvailable: true, isPopular: true },
  { id: 301, restaurantId: 3, name: "Crunchy Chicken", description: "Golden crispy fried chicken pieces", price: 2200, image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop", category: "Chicken", isAvailable: true, isPopular: true },
  { id: 302, restaurantId: 3, name: "Chicken Wrap", description: "Grilled chicken wrap with salad and mayo", price: 1800, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", category: "Wraps", isAvailable: true, isPopular: false },
  { id: 303, restaurantId: 3, name: "Rice Bowl", description: "Rice with chicken and pepper sauce", price: 2000, image: "https://chowdeck.com/store/_next/image?url=https%3A%2F%2Fmenu-images-production.s3.eu-west-1.amazonaws.com%2F15b2688a-b377-59c6-a448-1c632d9c4349.jpeg&w=3840&q=75", category: "Bowls", isAvailable: true, isPopular: true },
  { id: 304, restaurantId: 3, name: "Coleslaw", description: "Fresh creamy coleslaw side", price: 500, image: "https://chowdeck.com/store/_next/image?url=https%3A%2F%2Fmenu-images-production.s3.eu-west-1.amazonaws.com%2F79818c88-8cb4-5a56-9e68-fe4d8ae193ee.jpeg&w=3840&q=75", category: "Sides", isAvailable: true, isPopular: false },
  { id: 401, restaurantId: 4, name: "Zinger Burger", description: "Spicy chicken fillet burger with lettuce and mayo", price: 3200, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: true },
  { id: 402, restaurantId: 4, name: "Bucket Meal", description: "8 pieces of original recipe chicken", price: 8500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPLe8Vb1wJ37EacVJBEa-wJTxkcmqtOCSdcg&s", category: "Chicken", isAvailable: true, isPopular: true },
  { id: 403, restaurantId: 4, name: "Fries", description: "Crispy golden french fries", price: 1000, image: "https://kfc.ee/wp-content/uploads/2021/10/Fries_L.png", category: "Sides", isAvailable: true, isPopular: false },
  { id: 801, restaurantId: 8, name: "Whopper", description: "Flame-grilled beef patty with tomatoes, lettuce, mayo, and pickles", price: 4500, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: true },
  { id: 802, restaurantId: 8, name: "Double Whopper", description: "Two flame-grilled beef patties with all the fixings", price: 6500, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: true },
  { id: 803, restaurantId: 8, name: "Chicken Royale", description: "Crispy chicken fillet in a sesame seed bun", price: 3800, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop", category: "Burgers", isAvailable: true, isPopular: false },
  { id: 804, restaurantId: 8, name: "Onion Rings", description: "Crispy golden onion rings", price: 1200, image: "https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=400&h=300&fit=crop", category: "Sides", isAvailable: true, isPopular: false },
  { id: 805, restaurantId: 8, name: "Milkshake", description: "Thick creamy vanilla or chocolate milkshake", price: 2000, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop", category: "Drinks", isAvailable: true, isPopular: true },
  { id: 901, restaurantId: 9, name: "Sweet Cream Ice Cream", description: "Our signature sweet cream base with your choice of mix-ins", price: 2500, image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop", category: "Ice Cream", isAvailable: true, isPopular: true },
  { id: 902, restaurantId: 9, name: "Strawberry Cheesecake", description: "Strawberry ice cream with cheesecake pieces and graham crackers", price: 3000, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop", category: "Ice Cream", isAvailable: true, isPopular: true },
  { id: 903, restaurantId: 9, name: "Ice Cream Cake", description: "Layered ice cream cake perfect for celebrations", price: 8500, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop", category: "Cakes", isAvailable: true, isPopular: true },
  { id: 904, restaurantId: 9, name: "Waffle Cone", description: "Crispy waffle cone with two scoops of your choice", price: 2000, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop", category: "Ice Cream", isAvailable: true, isPopular: false },
  { id: 905, restaurantId: 9, name: "Milkshake", description: "Thick blended milkshake in vanilla, chocolate or strawberry", price: 3500, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop", category: "Shakes", isAvailable: true, isPopular: true },
  { id: 501, restaurantId: 5, name: "Amala & Ewedu", description: "Soft amala with ewedu and assorted meat", price: 1500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxQxVCSpepvVRXSLjhx-PkRKocf2ep8iQmBw&s", category: "Local", isAvailable: true, isPopular: true },
  { id: 502, restaurantId: 5, name: "Pounded Yam & Egusi", description: "Smooth pounded yam with rich egusi soup", price: 1800, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRExAO3ptz-PTt4A4e7xlkt3rWNFVoBHx4bQg&s", category: "Local", isAvailable: true, isPopular: true },
  { id: 503, restaurantId: 5, name: "Beans & Plantain", description: "Stewed beans with fried plantain", price: 1000, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD7zq1H8RbbvqoFcxSQ1XnSUDcvoNiCT6cUA&s", category: "Local", isAvailable: true, isPopular: false },
  { id: 601, restaurantId: 6, name: "Salad Bowl", description: "Fresh garden salad with grilled chicken", price: 2000, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmo8Q3885VULbpiTy_8Eysf6AdZwGhGEqvUQ&s", category: "Healthy", isAvailable: true, isPopular: false },
  { id: 602, restaurantId: 6, name: "Jollof Spaghetti", description: "Spicy jollof spaghetti with chicken", price: 1500, image: "https://www.africanrecipes.com.ng/wp-content/uploads/2025/08/jollof-spaghetti-nigerian-dish.png", category: "Main", isAvailable: true, isPopular: true },
  { id: 603, restaurantId: 6, name: "Fruit Smoothie", description: "Blended fresh fruits with yogurt", price: 800, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop", category: "Drinks", isAvailable: true, isPopular: false },
  { id: 701, restaurantId: 7, name: "Suya", description: "Spicy grilled beef skewers with onions and tomato", price: 1500, image: "https://cheflolaskitchen.com/wp-content/uploads/2025/07/Suya.jpg", category: "Grills", isAvailable: true, isPopular: true },
  { id: 702, restaurantId: 7, name: "Chicken Grill", description: "Flame-grilled chicken with jollof rice", price: 2200, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzFu_9xepJB1ePXg_UxEiFth25KPc1R7WbrQ&s", category: "Grills", isAvailable: true, isPopular: false },
  { id: 703, restaurantId: 7, name: "Ice Cream Sundae", description: "Vanilla ice cream with chocolate syrup and toppings", price: 1000, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop", category: "Desserts", isAvailable: true, isPopular: true },
];

const MENU_KEY = "md_menu_overrides";

// Always read live items — merges base data with admin overrides/additions
export function getLiveMenuItems(): MenuItem[] {
  try {
    const saved = localStorage.getItem(MENU_KEY);
    if (!saved) return menuItems;
    const overrides: MenuItem[] = JSON.parse(saved);
    // Merge: admin items replace base items with same id; new items (not in base) are appended
    const baseIds = new Set(menuItems.map((m) => m.id));
    const overrideMap = new Map(overrides.map((m) => [m.id, m]));
    const merged = menuItems.map((m) => overrideMap.get(m.id) ?? m);
    const newItems = overrides.filter((m) => !baseIds.has(m.id));
    return [...merged, ...newItems];
  } catch {
    return menuItems;
  }
}

// Live popular meals — reads from admin overrides
export function getLivePopularMeals() {
  return getLiveMenuItems()
    .filter((m) => m.isPopular && m.isAvailable)
    .map((m) => ({
      ...m,
      restaurantName: restaurants.find((r) => r.id === m.restaurantId)?.name ?? "",
      deliveryTimeMin: restaurants.find((r) => r.id === m.restaurantId)?.deliveryTimeMin ?? 20,
      deliveryTimeMax: restaurants.find((r) => r.id === m.restaurantId)?.deliveryTimeMax ?? 40,
    }));
}

// Static exports kept for backward compat
export const popularMeals = getLivePopularMeals();