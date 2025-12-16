import { useEffect, useState } from "react";
import useDistrictStore from "../../../store/districtStore";
import useProvinceStore from "../../../store/provinceStore";

const DistrictPage = () => {
  const {
    districts,
    fetchDistricts,
    addDistrict,
    updateDistrict,
    deleteDistrict,
  } = useDistrictStore();

  const { provinces, fetchProvinces } = useProvinceStore();

  const [form, setForm] = useState({
    id: "",
    provinceId: "",
    districtName: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDistricts();
    fetchProvinces();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.provinceId || !form.districtName) {
      alert("Please fill all fields");
      return;
    }

    if (isEditing) {
      updateDistrict(form.id, {
        districtName: form.districtName,
        provinceId: form.provinceId,
      });
    } else {
      addDistrict({
        districtName: form.districtName,
        provinceId: form.provinceId,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setForm({ id: "", provinceId: "", districtName: "" });
    setIsEditing(false);
  };

  const handleEdit = (d: any) => {
    setForm({
      id: d.id,
      provinceId: d.provinceId,
      districtName: d.districtName,
    });
    setIsEditing(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">District Management</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded-lg shadow-md mb-6"
      >
        <h2 className="text-lg font-semibold mb-2">
          {isEditing ? "Edit District" : "Add District"}
        </h2>

        <div className="mb-3">
          <label className="block">Province</label>
          <select
            className="border p-2 w-full rounded"
            value={form.provinceId}
            onChange={(e) =>
              setForm({ ...form, provinceId: e.target.value })
            }
          >
            <option value="">-- Select Province --</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.provinceName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block">District Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={form.districtName}
            onChange={(e) =>
              setForm({ ...form, districtName: e.target.value })
            }
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded shadow"
          >
            {isEditing ? "Update" : "Create"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 border text-left">#</th>
            <th className="p-2 border text-left">District Name</th>
            <th className="p-2 border text-left">Province</th>
            <th className="p-2 border text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {districts.map((d, index) => (
            <tr key={d.id} className="border-b hover:bg-gray-50">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{d.districtName}</td>
              <td className="p-2 border">
                {
                  provinces.find((p) => p.id === d.provinceId)?.provinceName ||
                  "-"
                }
              </td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => handleEdit(d)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteDistrict(d.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {districts.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-3">
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DistrictPage;
