
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const initialForm = {
  name: "",
  category: "Ingredients",
  ingredientKey: "",
  quantity: "",
  unit: "kg",
  usagePerPizza: "0",
  minStock: "5",
  supplier: "",
  isActive: true,
};

const units = [
  "kg",
  "g",
  "litres",
  "ml",
  "pieces",
  "packets",
  "boxes",
];

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/inventory");
      setItems(response.data.items || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Statistics
  const lowStockItems = items.filter(
    (item) => item.isActive !== false && item.quantity <= item.minStock
  );

  const totalItems = items.length;

  const activeItems = items.filter(
    (item) => item.isActive !== false
  );

  // Search and filter
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.name?.toLowerCase().includes(searchText) ||
        item.supplier?.toLowerCase().includes(searchText) ||
        item.ingredientKey?.toLowerCase().includes(searchText);

      const isLowStock = item.quantity <= item.minStock;

      const matchesStock =
        filter === "All" ||
        (filter === "Low Stock" && isLowStock) ||
        (filter === "In Stock" && !isLowStock) ||
        (filter === "Inactive" && item.isActive === false);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [items, search, filter, categoryFilter]);

  // Add inventory
  const handleAdd = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  // Edit inventory
  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      category: item.category || "Ingredients",
      ingredientKey: item.ingredientKey || "",
      quantity: String(item.quantity ?? ""),
      unit: item.unit || "kg",
      usagePerPizza: String(item.usagePerPizza ?? 0),
      minStock: String(item.minStock ?? 5),
      supplier: item.supplier || "",
      isActive: item.isActive !== false,
    });

    setEditingId(item._id);
    setError("");
    setShowForm(true);
  };

  // Form input changes
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save inventory
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isIngredient = form.category === "Ingredients";

      const payload = {
        name: form.name.trim(),
        category: form.category,
        ingredientKey: isIngredient
          ? form.ingredientKey.trim().toLowerCase().replace(/\s+/g, "_")
          : "",
        quantity: Number(form.quantity),
        unit: form.unit,
        usagePerPizza: isIngredient
          ? Number(form.usagePerPizza)
          : 0,
        minStock: Number(form.minStock),
        supplier: form.supplier.trim(),
        isActive: form.isActive,
      };

      if (!payload.name) {
        throw new Error("Inventory name is required.");
      }

      if (
        !Number.isFinite(payload.quantity) ||
        payload.quantity < 0 ||
        !Number.isFinite(payload.minStock) ||
        payload.minStock < 0
      ) {
        throw new Error("Enter valid stock quantities.");
      }

      if (isIngredient && !payload.ingredientKey) {
        throw new Error("Ingredient key is required.");
      }

      if (
        isIngredient &&
        (!Number.isFinite(payload.usagePerPizza) ||
          payload.usagePerPizza < 0)
      ) {
        throw new Error("Enter a valid usage per pizza.");
      }

      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload);
        setSuccess("Inventory updated successfully!");
      } else {
        await api.post("/inventory", payload);
        setSuccess("Inventory item added successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...initialForm });

      await fetchInventory();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save inventory."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete inventory
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory item?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/inventory/${id}`);

      setItems((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setSuccess("Inventory item deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete inventory item."
      );
    }
  };

  // Stock adjustment
  const adjustStock = async (item, amount) => {
    const newQuantity = Math.max(0, item.quantity + amount);

    try {
      setError("");
      setSuccess("");

      const response = await api.put(`/inventory/${item._id}`, {
        quantity: newQuantity,
      });

      setItems((previous) =>
        previous.map((current) =>
          current._id === item._id ? response.data.item : current
        )
      );

      setSuccess(`${item.name} stock updated.`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update stock."
      );
    }
  };

  // Activate / deactivate inventory
  const toggleActive = async (item) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.put(`/inventory/${item._id}`, {
        isActive: item.isActive === false,
      });

      setItems((previous) =>
        previous.map((current) =>
          current._id === item._id ? response.data.item : current
        )
      );

      setSuccess(
        `${item.name} ${
          response.data.item.isActive ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update ingredient status."
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage ingredients, recipes, stock levels and suppliers.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          + Add Inventory
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
        <StatCard
          title="Total Inventory Items"
          value={totalItems}
          icon="📦"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon="⚠️"
          warning={lowStockItems.length > 0}
        />

        <StatCard
          title="Active Inventory Items"
          value={activeItems.length}
          icon="✅"
        />
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="mb-3 font-bold text-red-700">
            ⚠️ Low Stock Alerts ({lowStockItems.length})
          </h3>

          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item._id}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-600"
              >
                {item.name}: {item.quantity} {item.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <input
          type="text"
          placeholder="Search ingredients, keys or suppliers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3"
        >
          <option value="All">All Categories</option>
          <option value="Ingredients">Ingredients</option>
          <option value="Packaging">Packaging</option>
          <option value="Beverages">Beverages</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3"
        >
          <option value="All">All Stock</option>
          <option value="In Stock">Healthy Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={fetchInventory}
          className="rounded-xl border border-gray-200 px-5 py-3 font-medium hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Inventory table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h3 className="font-bold text-gray-900">
            Inventory Items ({filteredItems.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-orange-500">
            Loading inventory...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-5xl">📦</div>
            <h3 className="font-bold text-gray-800">
              No inventory items found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add your first inventory item to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-5 py-4">Inventory</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Recipe Key</th>
                  <th className="px-5 py-4">Usage / Pizza</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Adjust</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const isLowStock =
                    item.quantity <= item.minStock;

                  const isActive = item.isActive !== false;

                  return (
                    <tr
                      key={item._id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {item.supplier || "No supplier"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Minimum: {item.minStock} {item.unit}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.category}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {item.quantity} {item.unit}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.category === "Ingredients"
                          ? item.ingredientKey || "Not configured"
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.category === "Ingredients"
                          ? `${item.usagePerPizza || 0} ${item.unit}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`w-fit rounded-full px-3 py-2 text-xs font-semibold ${
                              !isActive
                                ? "bg-gray-100 text-gray-600"
                                : isLowStock
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {!isActive
                              ? "Inactive"
                              : isLowStock
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustStock(item, -1)}
                            disabled={item.quantity <= 0}
                            className="h-8 w-8 rounded-lg border border-gray-200 font-bold hover:bg-gray-100 disabled:opacity-40"
                          >
                            −
                          </button>

                          <button
                            onClick={() => adjustStock(item, 1)}
                            className="h-8 w-8 rounded-lg border border-gray-200 font-bold hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleActive(item)}
                            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                            {isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-6 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Inventory" : "Add Inventory"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Configure stock and ingredient consumption.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-2xl text-gray-400 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Inventory Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Mozzarella Cheese"
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
                    <option value="Ingredients">Ingredients</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>

                <FormField label="Stock Unit">
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Ingredient recipe configuration */}
              {form.category === "Ingredients" && (
                <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h3 className="font-bold text-orange-800">
                    Ingredient Recipe Configuration
                  </h3>

                  <FormField label="Ingredient Key">
                    <input
                      name="ingredientKey"
                      value={form.ingredientKey}
                      onChange={handleChange}
                      required
                      placeholder="mozzarella"
                      className="form-input"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use a unique key without spaces. Example: mozzarella.
                    </p>
                  </FormField>

                  <FormField label="Usage Per Pizza">
                    <input
                      name="usagePerPizza"
                      type="number"
                      min="0"
                      step="any"
                      value={form.usagePerPizza}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The amount consumed for one pizza, in the selected stock unit.
                    </p>
                  </FormField>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Current Quantity">
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </FormField>

                <FormField label="Minimum Stock Level">
                  <input
                    name="minStock"
                    type="number"
                    min="0"
                    step="any"
                    value={form.minStock}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField label="Supplier Name">
                <input
                  name="supplier"
                  value={form.supplier}
                  onChange={handleChange}
                  placeholder="Supplier name"
                  className="form-input"
                />
              </FormField>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-orange-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    Active inventory item
                  </span>
                  <span className="text-xs text-gray-500">
                    Inactive ingredients will not be used for automatic deduction.
                  </span>
                </span>
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
                    ? "Update Inventory"
                    : "Add Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, warning }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <h2
        className={`mt-3 text-3xl font-bold ${
          warning ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

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
