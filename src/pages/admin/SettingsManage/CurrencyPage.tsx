// src/pages/currency/CurrencyPage.tsx
import { useEffect, useState } from "react";
import useCurrencyStore from "../../../store/currencyStore";
import type {
  CurrencyAttributes,
  CurrencyCreateInput,
} from "../../../types/currency";

const CurrencyPage = () => {
  const {
    currencies,
    fetchCurrencies,
    addCurrency,
    updateCurrency,
    deleteCurrency,
  } = useCurrencyStore();

  const [form, setForm] = useState<Partial<CurrencyCreateInput>>({
    currencyCode: "",
    currencyName: "",
    symbol: "",
    exchangeRate: 0,
    isDefault: false,
    status: "ACTIVE",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string>("");

  useEffect(() => {
    const loadCurrencies = async () => {
      await fetchCurrencies(); // รอ fetch เสร็จ
    };
    loadCurrencies();
  }, [fetchCurrencies]);
  console.log("Currencies:", currencies);

  const resetForm = () => {
    setForm({
      currencyCode: "",
      currencyName: "",
      symbol: "",
      exchangeRate: 0,
      isDefault: false,
      status: "ACTIVE",
    });
    setIsEditing(false);
    setEditId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currencyCode || !form.currencyName || !form.symbol) {
      alert("ກະລຸນາໃສ່ຂໍ້ມູນທີ່ຈໍາເປັນ");
      return;
    }

    if (isEditing && editId) {
      updateCurrency(editId, form);
    } else {
      addCurrency(form as CurrencyCreateInput);
    }

    resetForm();
  };

  const handleEdit = (currency: CurrencyAttributes) => {
    setForm(currency);
    setIsEditing(true);
    setEditId(currency.id);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ຈັດການສະກຸນເງິນ</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded-lg shadow-md mb-6"
      >
        <h2 className="text-lg font-semibold mb-2">
          {isEditing ? "ແກ້ໄຂ" : "ເພີ່ມ"} ສະກຸນເງິນ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">ລະຫັດສະກຸນເງິນ</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={form.currencyCode || ""}
              onChange={(e) =>
                setForm({ ...form, currencyCode: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1">ຊື່ສະກຸນເງິນ</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={form.currencyName || ""}
              onChange={(e) =>
                setForm({ ...form, currencyName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1">ສັນຍາລັກ</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={form.symbol || ""}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1">ອັດຕາແລກປ່ຽນ</label>
            <input
              type="number"
              className="border p-2 w-full rounded"
              value={form.exchangeRate || 0}
              onChange={(e) =>
                setForm({ ...form, exchangeRate: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block mb-1">ສະກຸນເງິນຫຼັກ</label>
            <input
              type="checkbox"
              checked={form.isDefault || false}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
            />
          </div>

          <div>
            <label className="block mb-1">ສະຖານະ</label>
            <select
              className="border p-2 w-full rounded"
              value={form.status || "ACTIVE"}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "ACTIVE" | "INACTIVE",
                })
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow"
          >
            {isEditing ? "ແກ້ໄຂ" : "ສ້າງໃໝ່"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
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
            <th className="p-2 border">ລະຫັດ</th>
            <th className="p-2 border">ຊື່</th>
            <th className="p-2 border">ສັນຍາລັກ</th>
            <th className="p-2 border">ອັດຕາແລກປ່ຽນ</th>
            <th className="p-2 border">ສະກຸນເງິນຫຼັກ</th>
            <th className="p-2 border">ສະຖານະ</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {currencies.map((c, index) => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{c.currencyCode}</td>
              <td className="p-2 border">{c.currencyName}</td>
              <td className="p-2 border">{c.symbol}</td>
              <td className="p-2 border">{c.exchangeRate}</td>
              <td className="p-2 border">{c.isDefault ? "Yes" : "No"}</td>
              <td className="p-2 border">{c.status}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  ແກ້ໄຂ
                </button>
                <button
                  onClick={() => deleteCurrency(c.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  ລົບ
                </button>
              </td>
            </tr>
          ))}
          {currencies.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-3">
                ບໍ່ພົບຂໍ້ມູນ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyPage;
