import { useState } from "react";

type Bill = {
  id: string;
  patient: string;
  service: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
};

const initialBills: Bill[] = [
  { id: "INV001", patient: "Rohan Mukherjee", service: "Cardiology Consultation", date: "2026-03-25", amount: 1250, status: "Paid" },
  { id: "INV002", patient: "Priyanka Sen", service: "Diabetes Treatment Package", date: "2026-04-01", amount: 3500, status: "Paid" },
  { id: "INV003", patient: "Arindam Chakraborty", service: "Cardiac Surgery", date: "2026-03-30", amount: 15000, status: "Paid" },
  { id: "INV004", patient: "Madhumita Roy", service: "General Checkup", date: "2026-03-22", amount: 450, status: "Paid" },
  { id: "INV005", patient: "Soumen Banerjee", service: "Pneumonia Treatment", date: "2026-03-15", amount: 2800, status: "Paid" },
  { id: "INV006", patient: "Tanaya Ghosh", service: "Neurological Consultation", date: "2026-04-03", amount: 680, status: "Pending" },
];

const inrCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Billing() {
  const [bills, setBills] = useState(initialBills);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Bill>({
    id: "",
    patient: "",
    service: "",
    date: "",
    amount: 0,
    status: "Pending",
  });

  const generateId = () => {
    const num = bills.length + 1;
    return `INV${String(num).padStart(3, "0")}`;
  };

  const statusStyle = (status: string) => {
    if (status === "Paid") return "bg-green-100 text-green-600";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Overdue") return "bg-red-100 text-red-600";
    return "bg-gray-100";
  };

  const filtered = bills.filter((b) => {
    return (
      (b.patient.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "All" || b.status === statusFilter)
    );
  });

  const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);
  const paid = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const pending = bills.filter((b) => b.status === "Pending").reduce((s, b) => s + b.amount, 0);
  const overdue = bills.filter((b) => b.status === "Overdue").reduce((s, b) => s + b.amount, 0);

  const changeStatus = (id: string, status: Bill["status"]) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const handleSave = () => {
    if (!form.patient) return;

    if (editingId) {
      setBills(bills.map((b) => (b.id === editingId ? form : b)));
    } else {
      const newBill = { ...form, id: generateId() };
      setBills([...bills, newBill]);
    }

    setShowModal(false);
    setEditingId(null);

    setForm({
      id: "",
      patient: "",
      service: "",
      date: "",
      amount: 0,
      status: "Pending",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this invoice?")) {
      setBills(bills.filter((b) => b.id !== id));
    }
  };

  const handleEdit = (bill: Bill) => {
    setForm(bill);
    setEditingId(bill.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Billing</h1>
          <p className="text-gray-500 text-sm">Manage invoices and payments</p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Invoice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Card title="Total Revenue" value={totalRevenue} color="blue" />
        <Card title="Paid" value={paid} color="green" />
        <Card title="Pending" value={pending} color="yellow" />
        <Card title="Overdue" value={overdue} color="red" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow border flex gap-3">
        <input
          placeholder="Search by patient or invoice ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg text-sm outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="grid grid-cols-[120px_1.5fr_2fr_140px_120px_140px_260px] px-6 py-3 text-xs font-semibold text-gray-400 uppercase border-b bg-gray-50">
          <span>Invoice ID</span>
          <span>Patient</span>
          <span>Service</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-[120px_1.5fr_2fr_140px_120px_140px_260px] px-6 py-4 items-center border-b transition hover:shadow-md hover:bg-gray-50"
          >
            <span className="text-blue-600 font-medium">{b.id}</span>
            <span>{b.patient}</span>
            <span className="truncate">{b.service}</span>
            <span>{b.date}</span>
            <span>{inrCurrency.format(b.amount)}</span>

            <select
              value={b.status}
              onChange={(e) =>
                changeStatus(b.id, e.target.value as Bill["status"])
              }
              className={`text-xs px-2 py-1 rounded-full w-[110px] text-center ${statusStyle(
                b.status
              )}`}
            >
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>

            <div className="flex gap-3 text-sm">
              <button onClick={() => handleEdit(b)} className="text-blue-600">
                Edit
              </button>

              <button onClick={() => handleDelete(b.id)} className="text-red-500">
                Delete
              </button>

              {b.status !== "Paid" && (
                <button
                  onClick={() => changeStatus(b.id, "Paid")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Invoice" : "Add Invoice"}
            </h2>

            <input
              placeholder="Patient Name"
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Service"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="border p-2 w-full rounded"
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border p-2 w-full rounded"
            />

            <input
              type="number"
              placeholder="Amount"
              value={form.amount || ""}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
              className="border p-2 w-full rounded"
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as Bill["status"] })
              }
              className="border p-2 w-full rounded"
            >
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const map: Record<"blue" | "green" | "yellow" | "red", string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow border">
      <p className={`text-xl font-bold ${map[color]}`}>
        {inrCurrency.format(value)}
      </p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}