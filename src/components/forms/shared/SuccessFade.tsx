import { Box, Fade, Typography } from "@mui/material";
import CircularProgressBar from "../../progressBar/CircularProgressBar";

interface SuccessFadeProps {
  show: boolean;
  message: string;
  redirectText?: string;
}

export default function SuccessFade({
  show,
  message,
  redirectText = "Redirecting...",
}: SuccessFadeProps) {
  return (
    <Fade in={show} timeout={600}>
      <Box
        sx={{
          textAlign: "center",
          mb: show ? 2 : 0,
          transform: show ? "scale(1)" : "scale(0.95)",
          transition: "all 0.4s ease",
        }}
      >
        {show && (
          <>
            <CircularProgressBar />
            <Typography
              sx={{ mt: 1, fontWeight: 600, color: "#4caf50", fontSize: 14 }}
            >
              {message}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#888" }}>
              {redirectText}
            </Typography>
          </>
        )}
      </Box>
    </Fade>
  );
}