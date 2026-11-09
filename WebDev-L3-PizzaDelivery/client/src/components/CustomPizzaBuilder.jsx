
import { useMemo, useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { useCart } from "../context/CartContext";

const sizes = [
  { name: "Small", price: 0, description: "6 inches" },
  { name: "Medium", price: 100, description: "9 inches" },
  { name: "Large", price: 200, description: "12 inches" },
];

const crusts = [
  { name: "Classic", price: 0 },
  { name: "Thin Crust", price: 30 },
  { name: "Cheese Burst", price: 80 },
  { name: "Wheat Crust", price: 50 },
];

const cheeses = [
  { name: "Mozzarella", price: 40 },
  { name: "Cheddar", price: 50 },
  { name: "Extra Cheese", price: 70 },
];

const toppings = [
  { name: "Onion", price: 20, emoji: "🧅" },
  { name: "Capsicum", price: 20, emoji: "🫑" },
  { name: "Tomato", price: 20, emoji: "🍅" },
  { name: "Mushroom", price: 30, emoji: "🍄" },
  { name: "Olives", price: 30, emoji: "🫒" },
  { name: "Sweet Corn", price: 25, emoji: "🌽" },
  { name: "Paneer", price: 40, emoji: "🧀" },
  { name: "Chicken", price: 60, emoji: "🍗" },
];

const CustomPizzaBuilder = () => {
  const { addToCart } = useCart();

  const [size, setSize] = useState("Medium");
  const [crust, setCrust] = useState("Classic");
  const [cheese, setCheese] = useState("Mozzarella");

  const [selectedToppings, setSelectedToppings] = useState([
    "Onion",
    "Capsicum",
  ]);

  const [quantity, setQuantity] = useState(1);

  const toggleTopping = (name) => {
    setSelectedToppings((previous) =>
      previous.includes(name)
        ? previous.filter((item) => item !== name)
        : [...previous, name]
    );
  };

  // Calculate custom pizza price
  const totalPrice = useMemo(() => {
    const sizePrice =
      sizes.find((item) => item.name === size)?.price || 0;

    const crustPrice =
      crusts.find((item) => item.name === crust)?.price || 0;

    const cheesePrice =
      cheeses.find((item) => item.name === cheese)?.price || 0;

    const toppingPrice = toppings
      .filter((item) => selectedToppings.includes(item.name))
      .reduce((total, item) => total + item.price, 0);

    const singlePizzaPrice =
      200 + sizePrice + crustPrice + cheesePrice + toppingPrice;

    return singlePizzaPrice * quantity;
  }, [size, crust, cheese, selectedToppings, quantity]);

  // Add custom pizza to cart
  const handleBuild = () => {
    const customPizza = {
      name: "Custom Pizza",
      size,
      crust,
      cheese,
      toppings: selectedToppings,
      price: totalPrice / quantity,
      isCustom: true,
      foodType: "Pizza",
      category: selectedToppings.includes("Chicken")
        ? "Non-Veg"
        : "Veg",
    };

    try {
      addToCart(customPizza, quantity);
    } catch (error) {
      console.error("Add custom pizza error:", error);
      alert("Unable to add custom pizza to cart.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Build Your Own Pizza 🍕
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Customize your pizza with your favourite ingredients.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">

          {/* Size */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 text-lg font-bold">
              1. Choose Pizza Size
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {sizes.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setSize(item.name)}
                  className={`rounded-xl border p-4 text-center ${
                    size === item.name
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <span className="block text-lg font-bold">
                    {item.name}
                  </span>

                  <span className="mt-1 block text-xs">
                    {item.description}
                  </span>

                  <span className="mt-2 block text-sm font-semibold">
                    {item.price === 0
                      ? "Base price"
                      : `+${formatCurrency(item.price)}`}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Crust */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 text-lg font-bold">
              2. Choose Your Crust
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {crusts.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setCrust(item.name)}
                  className={`rounded-lg border p-3 text-sm font-medium ${
                    crust === item.name
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {item.name}

                  <span className="mt-1 block text-xs">
                    {item.price === 0
                      ? "Free"
                      : `+${formatCurrency(item.price)}`}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Cheese */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 text-lg font-bold">
              3. Select Cheese
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {cheeses.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setCheese(item.name)}
                  className={`rounded-lg border p-3 text-sm font-medium ${
                    cheese === item.name
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {item.name}

                  <span className="mt-1 block text-xs">
                    +{formatCurrency(item.price)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Toppings */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-1 text-lg font-bold">
              4. Add Your Toppings
            </h3>

            <p className="mb-4 text-sm text-gray-500">
              Select as many toppings as you like.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {toppings.map((item) => {
                const selected = selectedToppings.includes(item.name);

                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => toggleTopping(item.name)}
                    className={`rounded-xl border p-3 text-center transition ${
                      selected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <span className="block text-2xl">
                      {item.emoji}
                    </span>

                    <span className="mt-2 block text-sm font-semibold">
                      {item.name}
                    </span>

                    <span className="mt-1 block text-xs text-gray-500">
                      +{formatCurrency(item.price)}
                    </span>

                    <span className="mt-2 block text-xs font-medium text-orange-600">
                      {selected ? "✓ Selected" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="h-fit rounded-xl border bg-white p-5 shadow-sm lg:sticky lg:top-5">
          <h3 className="text-lg font-bold text-gray-800">
            Your Pizza Summary
          </h3>

          <div className="my-5 flex justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-orange-200 bg-orange-50 text-7xl shadow-inner">
              🍕
            </div>
          </div>

          <div className="space-y-3 border-b pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Pizza</span>
              <span>{formatCurrency(200)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Size</span>
              <span>{size}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Crust</span>
              <span>{crust}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Cheese</span>
              <span>{cheese}</span>
            </div>

            <div>
              <p className="mb-2 text-gray-500">Toppings</p>

              <p className="text-gray-700">
                {selectedToppings.length
                  ? selectedToppings.join(", ")
                  : "No toppings selected"}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between py-4">
            <span className="font-medium">Quantity</span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg border disabled:opacity-40"
              >
                -
              </button>

              <span className="font-semibold">{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(10, q + 1))
                }
                disabled={quantity >= 10}
                className="h-8 w-8 rounded-lg border disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span className="text-orange-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBuild}
              className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Build My Pizza
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Customization prices are sample values.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CustomPizzaBuilder;
