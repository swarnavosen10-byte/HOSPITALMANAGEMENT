import { useEffect, useState } from "react";

type Bill = {
  id: number;
  patient: string;
  amount: number;
};

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/billing")
      .then((res) => res.json())
      .then((data) => setBills(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="flex justify-between px-6 py-6 border-b border-gray-200/70 text-lg"
          >
            <span className="text-gray-800">{bill.patient}</span>
            <span className="font-medium text-gray-800">${bill.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}