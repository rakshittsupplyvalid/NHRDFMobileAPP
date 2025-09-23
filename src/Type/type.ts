export type FormData = {
  name: string;
  email: string;
  password: string;
  country: string | null;
  seedType: string | null;
  InspectionNo: string | null;
  crop: string | null;
  Variety: string | null;
  FarmerName: string | null;
  bio: string;
};

export type CommonPickerProps = {
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  label?: string;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

export type State = {
  form: Record<string, any>;
  hidden: Record<string, any>;
  fielddata: Record<string, any>;
  disable: Record<string, any>;
  status: Record<string, any>;
  refs: Record<string, any>;
};