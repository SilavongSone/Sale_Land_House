// src/pages/expense/ExpensePage.tsx
import { useEffect, useState } from "react";
import useExpenseStore from "../../../store/expenseStore";
import useProjectStore from "../../../store/projectStore";
import type { Expense, ExpenseCreateInput } from "../../../types/expense";

const ExpensePage = () => {
  const { expenses, fetchExpenses, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();
  const { projects, fetchProjects } = useProjectStore();

  const [form, setForm] = useState<Partial<ExpenseCreateInput>>({
    projectId: "",
    expenseCode: "",
    category: "OTHER",
    description: "",
    amount: 0,
    expenseDate: new Date().toISOString().slice(0, 10),
    vendor: "",
    receiptUrl: "",
    notes: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string>("");

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, []);

  const resetForm = () => {
    setForm({
      projectId: "",
      expenseCode: "",
      category: "OTHER",
      description: "",
      amount: 0,
      expenseDate: new Date().toISOString().slice(0, 10),
      vendor: "",
      receiptUrl: "",
      notes: "",
    });
    setIsEditing(false);
    setEditId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.expenseCode || !form.category || !form.description) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈໍາເປັນທັງໝົດ");
      return;
    }

    const payload = {
      projectId: form.projectId || "",
      expenseCode: form.expenseCode || "",
      category: form.category || "",
      description: form.description || "",
      amount: form.amount || 0,
      expenseDate: form.expenseDate || "",
      vendor: form.vendor || "",
      receiptUrl: form.receiptUrl || "",
      notes: form.notes || "",
    };

    if (isEditing && editId) {
      updateExpense(editId, payload);
    } else {
      addExpense(payload);
    }

    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setForm({
      projectId: expense.projectId,
      expenseCode: expense.expenseCode,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate.slice(0, 10),
      vendor: expense.vendor,
      receiptUrl: expense.receiptUrl,
      notes: expense.notes,
    });
    setIsEditing(true);
    setEditId(expense.id);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ຈັດການລາຍຈ່າຍ</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="border p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2">{isEditing ? "ແກ້ໄຂລາຍຈ່າຍ" : "ເພີ່ມລາຍຈ່າຍ"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">ໂຄງການ</label>
            <select
              className="border p-2 w-full rounded"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <option value="">-- ເລືອກໂຄງການ --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">ລະຫັດລາຍຈ່າຍ</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={form.expenseCode}
              onChange={(e) => setForm({ ...form, expenseCode: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1">ໝວດໝູ່</label>
            <select
              className="border p-2 w-full rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Expense["category"] })}
            >
              <option value="LAND_PURCHASE">LAND_PURCHASE</option>
              <option value="CONSTRUCTION">CONSTRUCTION</option>
              <option value="MARKETING">MARKETING</option>
              <option value="LEGAL">LEGAL</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">ຈໍານວນເງິນ</label>
            <input
              type="number"
              className="border p-2 w-full rounded"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block mb-1">ວັນທີລາຍຈ່າຍ</label>
            <input
              type="date"
              className="border p-2 w-full rounded"
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1">ຜູ້ສະໜອງ</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={form.vendor ?? ""}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-1">ລາຍລະອຽດ</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">ເອກະສານ receipt URL</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={form.receiptUrl ?? ""}
            onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">ໝາຍເຫດ</label>
          <textarea
            className="border p-2 w-full rounded"
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded shadow">
            {isEditing ? "ແກ້ໄຂ" : "ສ້າງ"}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded">
              ຍົກເລີກ
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 border">#</th>
            <th className="p-2 border">ລະຫັດລາຍຈ່າຍ</th>
            <th className="p-2 border">ໂຄງການ</th>
            <th className="p-2 border">ໝວດໝູ່</th>
            <th className="p-2 border">ຈໍານວນເງິນ</th>
            <th className="p-2 border">ວັນທີ</th>
            <th className="p-2 border">ຜູ້ສະໜອງ</th>
            <th className="p-2 border">ລາຍລະອຽດ</th>
            <th className="p-2 border">ການດໍາເນີນການ</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((e, index) => (
            <tr key={e.id} className="border-b hover:bg-gray-50">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{e.expenseCode}</td>
              <td className="p-2 border">{projects.find((p) => p.id === e.projectId)?.projectName || "-"}</td>
              <td className="p-2 border">{e.category}</td>
              <td className="p-2 border">{e.amount}</td>
              <td className="p-2 border">{new Date(e.expenseDate).toLocaleDateString("lo-LA")}</td>
              <td className="p-2 border">{e.vendor || "-"}</td>
              <td className="p-2 border">{e.description}</td>
              <td className="p-2 border flex gap-2">
                <button onClick={() => handleEdit(e)} className="px-3 py-1 bg-yellow-500 text-white rounded">
                  ແກ້ໄຂ
                </button>
                <button onClick={() => e.id && deleteExpense(e.id)} className="px-3 py-1 bg-red-600 text-white rounded">
                  ລົບ
                </button>
              </td>
            </tr>
          ))}

          {expenses.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center p-3">
                ບໍ່ພົບຂໍ້ມູນ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensePage;
