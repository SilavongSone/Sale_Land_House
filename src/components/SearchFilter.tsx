import { Button, SelectPicker, InputPicker, Row, Col } from "rsuite";

interface FilterOption {
  title: string;
  items: string[];
  labels?: Record<string, string>;
  type?: "select" | "input";
}

interface ColResponsive {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

interface SearchFilterProps {
  onSearchClick?: () => void;
  filters?: FilterOption[];
  colProps?: Record<string, ColResponsive>; // responsive col props
  onFilterSelect?: (title: string, value: string) => void;
  onClearFilters?: () => void;
  activeFilters?: Record<string, string>;
  disabledFilters?: Record<string, boolean>; // NEW: disabled state per filter
}

const SearchFilter = ({
  onSearchClick,
  filters = [],
  colProps = {},
  onFilterSelect,
  activeFilters = {},
  disabledFilters = {},
}: SearchFilterProps) => {
  if (!filters.length) return null;

  const createPickerData = (filter: FilterOption) => [
    { label: "ທັງໝົດ", value: "" },
    ...filter.items.map((item) => ({
      label: filter.labels?.[item] || item,
      value: item,
    })),
  ];

  const renderPicker = (filter: FilterOption) => {
    const isDisabled = disabledFilters[filter.title] || false;
    
    const commonProps = {
      data: createPickerData(filter),
      value: activeFilters[filter.title] || "",
      onChange: (val: any) => onFilterSelect?.(filter.title, val ?? ""),
      placeholder: isDisabled ? `ກະລຸນາເລືອກໂຄງການກ່ອນ` : `ເລືອກ ${filter.title}`,
      searchable: !isDisabled,
      cleanable: false,
      size: "sm" as const,
      block: true,
      disabled: isDisabled,
    };

    return filter.type === "input" ? <InputPicker {...commonProps} /> : <SelectPicker {...commonProps} />;
  };

  return (
    <div className="pb-4">
      <Row gutter={16} align="bottom">
        {filters.map((filter, index) => {
          const props = colProps[filter.title] || { xs: 24, sm: 12, md: 6, lg: 4 };
          return (
            <Col key={index} {...props}>
              <div className="flex flex-col">
                <div className="mb-1 text-sm font-semibold">{filter.title}</div>
                {renderPicker(filter)}
              </div>
            </Col>
          );
        })}

        <Col xs={4} sm={3} md={3} lg={2}>
          <Button appearance="primary" size="sm" onClick={onSearchClick} block>
            ຄົ້ນຫາ
          </Button>
        </Col>

      </Row>
    </div>
  );
};

export default SearchFilter;