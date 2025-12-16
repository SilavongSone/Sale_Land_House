import { Col, Input, InputGroup, Row } from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import { useState, useEffect } from "react";

interface SearchProps {
  onSearch?: (keyword: string) => void;
  placeholder?: string;
  defaultValue?: string;
  delay?: number;
}

const Search = ({
  onSearch,
  placeholder = "ຄົ້ນຫາ...",
  defaultValue = "",
  delay = 300,
}: SearchProps) => {
  const [keyword, setKeyword] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(keyword);
    }, delay);

    return () => clearTimeout(timer);
  }, [keyword, delay, onSearch]);

  return (
    <Row className="items-center justify-end">
      <Col xs={20}>
        <InputGroup inside size="sm">
          <Input
            placeholder={placeholder}
            value={keyword}
            onChange={setKeyword}
          />
          <InputGroup.Addon>
            <SearchIcon />
          </InputGroup.Addon>
        </InputGroup>
      </Col>
    </Row>
  );
};

export default Search;
