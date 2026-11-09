
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const initialForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category: "Veg",
  foodType: "Pizza",
  isAvailable: true,
};

export default function PizzaManagement() {
  const [pizzas, setPizzas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all pizzas from MongoDB
  const fetchPizzas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/pizzas/admin/all");

      setPizzas(response.data.pizzas || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load pizzas. Check admin authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  // Search and category filtering
  const filteredPizzas = useMemo(() => {
    return pizzas.filter((pizza) => {
      const matchesSearch = pizza.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ||
        pizza.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [pizzas, search, categoryFilter]);

  const availableCount = pizzas.filter(
    (pizza) => pizza.isAvailable
  ).length;

  // Open add form
  const handleAdd = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (pizza) => {
    setForm({
      name: pizza.name || "",
      description: pizza.description || "",
      price: pizza.price ?? "",
      image: pizza.image || "",
      category: pizza.category || "Veg",
      foodType: pizza.foodType || "Pizza",
      isAvailable: pizza.isAvailable ?? true,
    });

    setEditingId(pizza._id);
    setError("");
    setShowForm(true);
  };

  // Handle form inputs
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add or update pizza
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
      };

      if (!payload.name || !payload.description) {
        throw new Error("Name and description are required.");
      }

      if (!Number.isFinite(payload.price) || payload.price < 1) {
        throw new Error("Enter a valid price.");
      }

      if (editingId) {
        await api.put(`/pizzas/${editingId}`, payload);
        setSuccess("Pizza updated successfully!");
      } else {
        await api.post("/pizzas", payload);
        setSuccess("Pizza added successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...initialForm });

      await fetchPizzas();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save pizza."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete pizza
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pizza?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/pizzas/${id}`);

      setPizzas((previous) =>
        previous.filter((pizza) => pizza._id !== id)
      );

      setSuccess("Pizza deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete pizza."
      );
    }
  };

  // Toggle pizza availability
  const handleAvailability = async (pizza) => {
    try {
      setError("");
      setSuccess("");

      const updatedAvailability = !pizza.isAvailable;

      const response = await api.put(`/pizzas/${pizza._id}`, {
        isAvailable: updatedAvailability,
      });

      setPizzas((previous) =>
        previous.map((item) =>
          item._id === pizza._id
            ? response.data.pizza
            : item
        )
      );

      setSuccess("Availability updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update availability."
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...initialForm });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pizza Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your menu, prices and availability.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          + Add New Pizza
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Pizzas" value={pizzas.length} />
        <StatCard title="Available" value={availableCount} />
        <StatCard
          title="Unavailable"
          value={pizzas.length - availableCount}
        />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <input
          type="text"
          placeholder="Search pizza by name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
        >
          <option value="All">All Categories</option>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>

        <button
          onClick={fetchPizzas}
          className="flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-medium hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Pizza table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h3 className="font-bold text-gray-900">
            All Menu Items ({filteredPizzas.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-orange-500">
            Loading pizzas...
          </div>
        ) : filteredPizzas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-5xl">🍕</div>
            <h3 className="font-bold text-gray-800">
              No pizzas found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add a new pizza or change your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-4">Pizza</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Availability</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPizzas.map((pizza) => (
                  <tr
                    key={pizza._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {pizza.image ? (
                          <img
                            src={pizza.image}
                            alt={pizza.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                            🍕
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-800">
                            {pizza.name}
                          </p>
                          <p className="max-w-xs truncate text-xs text-gray-400">
                            {pizza.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {pizza.category}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {pizza.foodType}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(pizza.price)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleAvailability(pizza)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          pizza.isAvailable
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {pizza.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(pizza)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(pizza._id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-6 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Pizza" : "Add New Pizza"}
              </h2>

              <button
                onClick={closeForm}
                className="text-2xl text-gray-400 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <FormField label="Pizza Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Example: Margherita Pizza"
                  className="form-input"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Enter pizza description"
                  className="form-input"
                />
              </FormField>

              <FormField label="Price (₹)">
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="249"
                  className="form-input"
                />
              </FormField>

              <FormField label="Image URL">
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/pizza.jpg"
                  className="form-input"
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Category">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </FormField>

                <FormField label="Food Type">
                  <select
                    name="foodType"
                    value={form.foodType}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Pizza">Pizza</option>
                    <option value="Burger">Burger</option>
                    <option value="Noodles">Noodles</option>
                  </select>
                </FormField>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 accent-orange-500"
                />
                Available for customers
              </label>

              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Pizza"
                    : "Add Pizza"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Statistics card
function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </h2>
    </div>
  );
}

// Reusable form field
function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
