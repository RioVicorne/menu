'use client';

import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Giỏ hàng
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Trang giỏ hàng đang được phát triển...
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => router.push('/')}
      >
        Quay về trang chủ
      </Button>
    </Box>
  );
}
