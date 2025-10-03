'use client';

import React from 'react';
import { Typography, Box, Button, Card, CardContent, Grid, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: 'Phở Bò Tái',
      category: 'Phở',
      price: 65000,
      stock: 50,
      status: 'active'
    },
    {
      id: 2,
      name: 'Bún Chả Hà Nội',
      category: 'Bún',
      price: 55000,
      stock: 30,
      status: 'active'
    },
    {
      id: 3,
      name: 'Cơm Tấm Sài Gòn',
      category: 'Cơm',
      price: 45000,
      stock: 40,
      status: 'active'
    },
    {
      id: 4,
      name: 'Bánh Mì Thịt Nướng',
      category: 'Bánh Mì',
      price: 25000,
      stock: 60,
      status: 'active'
    },
    {
      id: 5,
      name: 'Chả Cá Lã Vọng',
      category: 'Món Đặc Biệt',
      price: 120000,
      stock: 15,
      status: 'active'
    },
    {
      id: 6,
      name: 'Nem Nướng Nha Trang',
      category: 'Món Đặc Biệt',
      price: 85000,
      stock: 25,
      status: 'active'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🍜 Quản lý món ăn
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Thêm món ăn mới
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng món ăn
              </Typography>
              <Typography variant="h4">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang hoạt động
              </Typography>
              <Typography variant="h4" color="success.main">
                {products.filter(p => p.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hết món
              </Typography>
              <Typography variant="h4" color="error.main">
                {products.filter(p => p.stock === 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng giá trị
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products List */}
      <Typography variant="h6" gutterBottom>
        Danh sách món ăn
      </Typography>
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Chip 
                    label={product.status === 'active' ? 'Hoạt động' : 'Ngừng bán'} 
                    color={product.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Danh mục: {product.category}
                </Typography>
                
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {formatCurrency(product.price)}
                </Typography>
                
                <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'}>
                  Tồn kho: {product.stock} sản phẩm
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    fullWidth
                  >
                    Sửa
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    fullWidth
                  >
                    Xóa
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
