
require("dotenv").config();

const mongoose = require("mongoose");
const Pizza = require("./models/Pizza");

const menuItems = [
  // ================= PIZZAS =================
  {
    name: "Margherita Pizza",
    foodType: "Pizza",
    description: "Classic mozzarella cheese, tomato sauce and fresh basil",
    price: 199,
    category: "Veg",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800",
    isAvailable: true,
  },
  {
    name: "Farmhouse Pizza",
    foodType: "Pizza",
    description: "Loaded with capsicum, onion, tomato and mozzarella",
    price: 279,
    category: "Veg",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    isAvailable: true,
  },
  {
    name: "Paneer Tikka Pizza",
    foodType: "Pizza",
    description: "Indian-style paneer tikka with onion and cheese",
    price: 299,
    category: "Veg",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800",
    isAvailable: true,
  },
  {
    name: "Chicken Pepperoni Pizza",
    foodType: "Pizza",
    description: "Chicken pepperoni, mozzarella and rich tomato sauce",
    price: 349,
    category: "Non-Veg",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    isAvailable: true,
  },

  // ================= BURGERS =================
  {
    name: "Classic Veg Burger",
    foodType: "Burger",
    description: "Crispy vegetable patty with lettuce and special sauce",
    price: 129,
    category: "Veg",
    image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/FOOD_CATALOG/IMAGES/CMS/2025/9/19/50ef853c-7570-48dd-a859-aac3725138e1_838ea0c7-c3eb-42c1-b00a-581122ec7545.jpg",
    isAvailable: true,
  },
  {
    name: "Double Cheese Burger",
    foodType: "Burger",
    description: "Double cheese, toasted bun and signature sauce",
    price: 229,
    category: "Veg",
    image: "https://mir-s3-cdn-cf.behance.net/project_modules/2800_opt_1/17d130113800893.602ed296d9182.jpg",
    isAvailable: true,
  },
  {
    name: "Crispy Chicken Burger",
    foodType: "Burger",
    description: "Crispy chicken fillet with lettuce and mayonnaise",
    price: 199,
    category: "Non-Veg",
    image: "https://images.deliveryhero.io/image/fd-pk/Products/97876981.jpg?width=800",
    isAvailable: true,
  },
  {
    name: "Chicken Cheese Burger",
    foodType: "Burger",
    description: "Chicken patty topped with melted cheese",
    price: 249,
    category: "Non-Veg",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    isAvailable: true,
  },

  // ================= NOODLES =================
  {
    name: "Veg Hakka Noodles",
    foodType: "Noodles",
    description: "Stir-fried noodles with fresh vegetables",
    price: 149,
    category: "Veg",
    image: "https://www.shahjis.com/website/img/menu/16.jpg",
    isAvailable: true,
  },
  {
    name: "Schezwan Noodles",
    foodType: "Noodles",
    description: "Spicy Schezwan noodles with crunchy vegetables",
    price: 169,
    category: "Veg",
    image: "https://ghydastuzabzfzpsihkb.supabase.co/storage/v1/object/public/post-images/featured/1769715562304-7pc18.png",
    isAvailable: true,
  },
  {
    name: "Chicken Noodles",
    foodType: "Noodles",
    description: "Wok-tossed noodles with chicken and vegetables",
    price: 199,
    category: "Non-Veg",
    image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/zxx92mc3wq3evd9sstvj",
    isAvailable: true,
  },
  {
    name: "Egg Noodles",
    foodType: "Noodles",
    description: "Classic noodles tossed with egg and seasoning",
    price: 179,
    category: "Non-Veg",
    image: "https://www.thambiskitchen.co.uk/cdn/shop/files/ChickenNoodles.png?v=1699356513",
    isAvailable: true,
  },
];

async function seedMenu() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    for (const item of menuItems) {
      await Pizza.updateOne(
        { name: item.name },
        { $set: item },
        { upsert: true }
      );
    }

    console.log(`${menuItems.length} menu items added or updated!`);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedMenu();
