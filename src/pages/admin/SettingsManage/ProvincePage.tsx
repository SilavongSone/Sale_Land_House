import { useEffect, useState } from "react";
import useProvinceStore from "../../../store/provinceStore";
import type { ProvinceAttributes } from "../../../types/province";

const ProvincePage = () => {
  const { provinces, fetchProvinces, addProvince, updateProvince, deleteProvince, loading } =
    useProvinceStore((state) => state);

  const [form, setForm] = useState<Partial<ProvinceAttributes>>({
    provinceName: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null); // ✅ number

  // Load data on mount
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.provinceName) return;

    if (editingId !== null) {
      updateProvince(editingId, form);
    } else {
      addProvince(form);
    }

    setForm({ provinceName: "" });
    setEditingId(null);
  };

  const handleEdit = (province: ProvinceAttributes) => {
    setEditingId(province.provinceId); // ✅ ใช้ provinceId
    setForm({
      provinceName: province.provinceName,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Province Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-4 border p-4 rounded">
        <input
          type="text"
          placeholder="Province Name"
          value={form.provinceName}
          onChange={(e) => setForm({ ...form, provinceName: e.target.value })}
          className="border p-2 rounded mr-2"
        />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId !== null ? "Update" : "Add"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ provinceName: "" });
            }}
            className="bg-gray-500 text-white ml-2 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Table */}
      {loading && <p>Loading...</p>}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#</th>
            <th className="border p-2">Province Name</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {provinces.map((prov, index) => (
            <tr key={prov.provinceId}> {/* ✅ ใช้ provinceId */}
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{prov.provinceName}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(prov)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProvince(prov.provinceId)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProvincePage;
