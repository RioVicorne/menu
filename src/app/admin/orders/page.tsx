'use client';

import React from 'react';
import { Typography, Box, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';

export default function OrdersPage() {
  const orders = [
    {
      id: 'ORD001',
      customer: 'Nguyễn Văn A',
      total: 25000000,
      status: 'pending',
      date: '2024-01-15',
      items: 2
    },
    {
      id: 'ORD002',
      customer: 'Trần Thị B',
      total: 35000000,
      status: 'processing',
      date: '2024-01-14',
      items: 1
    },
    {
      id: 'ORD003',
      customer: 'Lê Văn C',
      total: 22000000,
      status: 'completed',
      date: '2024-01-13',
      items: 1
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📋 Quản lý đơn hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và quản lý tất cả đơn hàng
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng đơn hàng
              </Typography>
              <Typography variant="h4">
                {orders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Chờ xử lý
              </Typography>
              <Typography variant="h4" color="warning.main">
                {orders.filter(o => o.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đang xử lý
              </Typography>
              <Typography variant="h4" color="info.main">
                {orders.filter(o => o.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hoàn thành
              </Typography>
              <Typography variant="h4" color="success.main">
                {orders.filter(o => o.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders List */}
      <Typography variant="h6" gutterBottom>
        Danh sách đơn hàng
      </Typography>
      <Grid container spacing={2}>
        {orders.map((order) => (
          <Grid item xs={12} sm={6} md={4} key={order.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    #{order.id}
                  </Typography>
                  <Chip 
                    label={getStatusText(order.status)} 
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Khách hàng: {order.customer}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Số sản phẩm: {order.items}
                </Typography>
                
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {formatCurrency(order.total)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ngày: {order.date}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<VisibilityIcon />}
                    fullWidth
                  >
                    Xem chi tiết
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    fullWidth
                  >
                    Cập nhật
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

