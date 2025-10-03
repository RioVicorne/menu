'use client';

import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📱 Chi tiết sản phẩm #{params.id}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Trang chi tiết sản phẩm đang được phát triển...
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
