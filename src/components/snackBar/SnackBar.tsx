import { Alert, Snackbar } from "@mui/material";

interface ISnackBar {
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
}: ISnackBar) {
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
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  );
}
