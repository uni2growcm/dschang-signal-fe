import { TextField } from "@mui/material";

interface FormTextFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  error?: boolean;
  helperText?: string | false;
}

export default function FormTextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  helperText,
}: FormTextFieldProps) {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      fullWidth
      variant="outlined"
      size="small"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          "&.Mui-focused fieldset": { borderColor: "#7c4dff" },
        },
      }}
    />
  );
}