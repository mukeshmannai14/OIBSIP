
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Components
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import PizzaCollection from "../components/PizzaCollection";
import PromoBanner from "../components/PromoBanner";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

function Home() {
  // Application states
  const [pizzas, setPizzas] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch pizzas from backend
  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/pizzas"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pizzas");
        }

        const data = await response.json();

        if (data.success) {
          setPizzas(data.pizzas || []);
        } else {
          toast.error("Unable to load menu");
        }
      } catch (error) {
        console.error("Pizza fetching error:", error);
        toast.error("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  // Add item to cart
  const addToCart = (pizza) => {
    if (!pizza.isAvailable) {
      toast.error("This item is currently unavailable");
      return;
    }

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => item._id === pizza._id
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item._id === pizza._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...pizza, quantity: 1 }];
    });

    toast.success(`${pizza.name} added to cart`);
  };

  // Update cart quantity
  const updateQuantity = (id, change) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item._id !== id)
    );

    toast.success("Item removed from cart");
  };

  // Toggle favorites
  const toggleFavorite = (id) => {
    setFavorites((previousFavorites) =>
      previousFavorites.includes(id)
        ? previousFavorites.filter((item) => item !== id)
        : [...previousFavorites, id]
    );
  };

  // Cart count
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Checkout placeholder
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    toast("Checkout integration is coming next");
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
        setCartOpen={setCartOpen}
      />

      <main>
        {/* HERO SECTION */}
        <Hero />

        {/* WHY CHOOSE US */}
        <WhyChooseUs />

        {/* FOOD COLLECTION */}
        <PizzaCollection
          pizzas={pizzas}
          onAddToCart={addToCart}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          loading={loading}
        />

        {/* PROMOTIONAL BANNER */}
        <PromoBanner />

        {/* ABOUT SECTION */}
        <About />

        {/* CUSTOMER TESTIMONIALS */}
        <Testimonials />

        {/* NEWSLETTER */}
        <Newsletter />
      </main>

      {/* FOOTER */}
      <Footer />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        onCheckout={handleCheckout}
      />
    </>
  );
}

export default Home;
