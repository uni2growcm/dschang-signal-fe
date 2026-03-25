import { Alert, Snackbar } from "@mui/material";

interface SnackBarProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  position?: "bottom-left" | "bottom-right";
  onClose?: () => void;
}

export default function SnackBar({
  open,
  message,
  severity,
  position = "bottom-left",
  onClose,
}: Readonly<SnackBarProps>) {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: position === "bottom-left" ? "left" : "right",
      }}
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
    >
      <Alert severity={severity} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
