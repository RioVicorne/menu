'use client';

import React from 'react';
import { Typography, Box, Card, CardContent, Grid, Chip, Button, Avatar } from '@mui/material';
import { Email as EmailIcon, Phone as PhoneIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

export default function CustomersPage() {
  const customers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      status: 'active',
      orders: 5,
      totalSpent: 125000000,
      joinDate: '2024-01-01'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0987654321',
      status: 'active',
      orders: 3,
      totalSpent: 75000000,
      joinDate: '2024-01-05'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0369852147',
      status: 'inactive',
      orders: 1,
      totalSpent: 22000000,
      joinDate: '2024-01-10'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          👥 Quản lý khách hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi thông tin và hoạt động của khách hàng
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng khách hàng
              </Typography>
              <Typography variant="h4">
                {customers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Khách hàng hoạt động
              </Typography>
              <Typography variant="h4" color="success.main">
                {customers.filter(c => c.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Khách hàng mới
              </Typography>
              <Typography variant="h4" color="info.main">
                {customers.filter(c => new Date(c.joinDate) > new Date('2024-01-01')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng doanh thu
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customers List */}
      <Typography variant="h6" gutterBottom>
        Danh sách khách hàng
      </Typography>
      <Grid container spacing={2}>
        {customers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} key={customer.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {getInitials(customer.name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {customer.name}
                    </Typography>
                    <Chip 
                      label={customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'} 
                      color={customer.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                    {customer.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                    {customer.phone}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Đơn hàng: {customer.orders}
                </Typography>
                
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {formatCurrency(customer.totalSpent)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Tham gia: {customer.joinDate}
                </Typography>
                
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<VisibilityIcon />}
                  fullWidth
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

