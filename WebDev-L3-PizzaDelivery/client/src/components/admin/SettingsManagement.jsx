
import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const initialSettings = {
  restaurantName: "",
  restaurantEmail: "",
  restaurantPhone: "",
  restaurantAddress: "",
  deliveryFee: 40,
  taxPercentage: 5,
  minimumOrder: 100,
  isStoreOpen: true,
  emailNotifications: true,
};

const SettingsManagement = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/settings");

      setSettings({
        ...initialSettings,
        ...response.data.settings,
      });
    } catch (err) {
      console.error("Settings fetch error:", err);
      setError(
        err.response?.data?.message || "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        ...settings,
        deliveryFee: Number(settings.deliveryFee),
        taxPercentage: Number(settings.taxPercentage),
        minimumOrder: Number(settings.minimumOrder),
      };

      const response = await api.put("/settings", payload);

      setSettings({
        ...initialSettings,
        ...response.data.settings,
      });

      setMessage("Settings saved successfully!");
    } catch (err) {
      console.error("Settings update error:", err);

      setError(
        err.response?.data?.message || "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Admin Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage restaurant details and application preferences.
        </p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Restaurant Information */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-gray-800">
            Restaurant Information
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Restaurant Name
              </label>
              <input
                name="restaurantName"
                value={settings.restaurantName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Restaurant Email
              </label>
              <input
                type="email"
                name="restaurantEmail"
                value={settings.restaurantEmail}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                name="restaurantPhone"
                value={settings.restaurantPhone}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Restaurant Address
              </label>
              <input
                name="restaurantAddress"
                value={settings.restaurantAddress}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-gray-800">
            Pricing & Charges
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="deliveryFee"
                value={settings.deliveryFee}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Current fee: {formatCurrency(settings.deliveryFee)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tax Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="taxPercentage"
                value={settings.taxPercentage}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Minimum Order (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="minimumOrder"
                value={settings.minimumOrder}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Current minimum: {formatCurrency(settings.minimumOrder)}
              </p>
            </div>
          </div>
        </section>

        {/* Store Preferences */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-gray-800">
            Store Preferences
          </h3>

          <div className="space-y-5">
            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  Store Availability
                </p>
                <p className="text-sm text-gray-500">
                  Allow customers to place orders.
                </p>
              </div>

              <input
                type="checkbox"
                name="isStoreOpen"
                checked={settings.isStoreOpen}
                onChange={handleChange}
                className="h-5 w-5 accent-orange-500"
              />
            </label>

            <div className="border-t" />

            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Enable application email notification preference.
                </p>
              </div>

              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="h-5 w-5 accent-orange-500"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <button
            type="button"
            onClick={fetchSettings}
            className="rounded-lg border px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManagement;
