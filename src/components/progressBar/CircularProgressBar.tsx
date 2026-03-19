import { CircularProgress } from "@mui/material";

interface CircularProgressBarProps {
  size?: number;
  color?: string;
}

export default function CircularProgressBar({
  size = 28,
  color = "#7c4dff",
}: CircularProgressBarProps) {
  return (
    <CircularProgress
      size={size}
      sx={{ color }}
    />
  );
}