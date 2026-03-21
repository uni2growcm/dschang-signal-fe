import { Box, Button, Typography } from '@mui/material';
import { ArrowBackOutlined, ArrowForwardOutlined } from '@mui/icons-material';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function PaginationControls({
  page,
  totalPages,
  onNext,
  onPrev,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      mt={4}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<ArrowBackOutlined />}
        onClick={onPrev}
        disabled={page === 1}
        sx={{ borderRadius: '20px', textTransform: 'none' }}
      >
        Previous
      </Button>

      <Typography variant="body2" color="text.secondary">
        Page {page} / {totalPages}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        endIcon={<ArrowForwardOutlined />}
        onClick={onNext}
        disabled={page === totalPages}
        sx={{ borderRadius: '20px', textTransform: 'none' }}
      >
        Next
      </Button>
    </Box>
  );
}
