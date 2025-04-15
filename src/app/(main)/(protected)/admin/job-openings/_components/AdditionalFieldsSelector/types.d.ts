interface AdditionalFieldSelectorProps {
  value: extraApplicationField[];
  onChange: (v: extraApplicationField[]) => void;
  disabled?: boolean
}

interface FieldRowProps {
  value: extraApplicationField;
  index: number;
  onChange: (v: extraApplicationField) => void;
  onDelete: () => void;
}
