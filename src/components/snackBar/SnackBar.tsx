import { Alert, Snackbar } from "@mui/material";

interface ISnackBar {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  position?: "bottom-left" | "bottom-right"; 
}

export default function SnackBar({
  open,
  message,
  severity,
  position = "bottom-left", 
}: ISnackBar) {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: position === "bottom-left" ? "left" : "right",
      }}
      open={open}
      autoHideDuration={5000}
      onClose={() => {}}
    >
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  );
}