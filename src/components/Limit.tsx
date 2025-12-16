import { SelectPicker } from "rsuite";

interface LimitProps {
  limit: number;
  total: number;
  onLimitChange: (limit: number) => void;
  baseOptions?: number[]; // dynamic base options
}

const Limit = ({
  limit,
  total,
  onLimitChange,
  baseOptions = [10, 25, 50, 100],
}: LimitProps) => {
  const limitOptions = [
    ...baseOptions.map((v) => ({
      label: v.toString(),
      value: v,
    })),
    {
      label: `ທັງໝົດ (${total})`,
      value: total,
    },
  ];

  const handleChange = (value: number | null) => {
    if (value !== null) {
      onLimitChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-sm text-gray-600 whitespace-nowrap">ສະແດງ</span>

      <SelectPicker
        data={limitOptions}
        value={limit}
        onChange={handleChange}
        searchable={false}
        cleanable={false}
        style={{ width: 80 }}
        size="sm"
        block
      />

      <span className="text-sm text-gray-600 hidden md:inline whitespace-nowrap">
        ລາຍການ
      </span>
    </div>
  );
};

export default Limit;
