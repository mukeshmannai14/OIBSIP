
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

const DELIVERY_FEE = 40;

function CartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeItem,
  onCheckout,
}) {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-[#fffaf3] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eadfd4] px-6 py-5">
              <div>
                <h2 className="text-2xl font-extrabold text-[#261713]">
                  Your Cart
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>

              <button
                onClick={onClose}
                aria-label="Close cart"
                className="rounded-full bg-white p-3 text-[#261713] shadow-sm transition hover:bg-[#f2e7dd]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-5 grid h-24 w-24 place-items-center rounded-full bg-[#e85d2a]/10 text-[#e85d2a]">
                    <ShoppingBag size={40} />
                  </div>

                  <h3 className="text-xl font-bold text-[#261713]">
                    Your cart is empty
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Add your favourite pizza to get started.
                  </p>

                  <button
                    onClick={onClose}
                    className="mt-6 rounded-full bg-[#e85d2a] px-6 py-3 font-semibold text-white transition hover:bg-[#c9471d]"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item._id}
                    className="flex gap-4 rounded-2xl border border-[#eadfd4] bg-white p-4"
                  >
                    {/* Product Image */}
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300"
                      }
                      alt={item.name}
                      className="h-24 w-24 rounded-xl object-cover"
                    />

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-[#261713]">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            ₹{item.price} each
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item._id)}
                          aria-label={`Remove ${item.name}`}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-full bg-[#fffaf3] p-1">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, -1)
                            }
                            aria-label="Decrease quantity"
                            className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-4 text-center text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item._id, 1)
                            }
                            aria-label="Increase quantity"
                            className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className="font-bold text-[#e85d2a]">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Price Summary */}
            {cart.length > 0 && (
              <div className="border-t border-[#eadfd4] bg-white p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>

                  <div className="flex justify-between border-t border-dashed border-[#eadfd4] pt-4 text-lg font-extrabold text-[#261713]">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#e85d2a] py-4 font-bold text-white transition hover:bg-[#c9471d]"
                >
                  Proceed to Checkout
                  <ArrowRight size={19} />
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  Payment will be securely processed at checkout.
                </p>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
