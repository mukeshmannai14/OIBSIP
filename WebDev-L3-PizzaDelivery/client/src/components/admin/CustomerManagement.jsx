
import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      const customerList = response.data.customers || [];

      setCustomers(customerList);
      setFilteredCustomers(customerList);
    } catch (err) {
      console.error("Customer fetch error:", err);
      setError(
        err.response?.data?.message || "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const searchTerm = search.toLowerCase();

    const filtered = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm)
    );

    setFilteredCustomers(filtered);
  }, [search, customers]);

  const viewCustomerOrders = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setOrdersLoading(true);
      setCustomerOrders([]);

      const response = await api.get(
        `/customers/${customer.firebaseUid}/orders`
      );

      setCustomerOrders(response.data.orders || []);
    } catch (err) {
      console.error("Customer orders error:", err);
      alert(
        err.response?.data?.message || "Unable to load customer orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeOrders = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-gray-500">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Customer Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage registered customers and view their orders.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white transition hover:bg-orange-600"
        >
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Customers</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-800">
            {customers.length}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Customers With Orders</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-800">
            {customers.filter((c) => c.totalOrders > 0).length}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Customer Spending</p>
          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(
              customers.reduce(
                (total, c) => total + (c.totalSpent || 0),
                0
              )
            )}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or email..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Registered</th>
                <th className="px-5 py-4">Total Orders</th>
                <th className="px-5 py-4">Total Spent</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.firebaseUid}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {customer.photoURL ? (
                          <img
                            src={customer.photoURL}
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                            {customer.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-800">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {customer.totalOrders || 0}
                    </td>

                    <td className="px-5 py-4 font-semibold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => viewCustomerOrders(customer)}
                        className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-100"
                      >
                        View Orders
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Order History
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCustomer.name} · {selectedCustomer.email}
                </p>
              </div>

              <button
                onClick={closeOrders}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {ordersLoading ? (
              <p className="py-10 text-center text-gray-500">
                Loading order history...
              </p>
            ) : customerOrders.length > 0 ? (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                          {order.orderStatus || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t pt-3">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={item._id || index}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium text-gray-700">
                            {formatCurrency(
                              (item.price || 0) * (item.quantity || 1)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-gray-500">
                This customer has not placed any orders yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
