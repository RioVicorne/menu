'use client';

import React from 'react';
import { Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export default function AdminPage() {
  const router = useRouter();

  const adminCards = [
    {
      title: 'Dashboard',
      description: 'Tổng quan hệ thống',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      path: '/admin/dashboard',
      color: '#667eea'
    },
    {
      title: 'Món ăn',
      description: 'Quản lý món ăn',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      path: '/admin/products',
      color: '#764ba2'
    },
    {
      title: 'Đơn hàng',
      description: 'Quản lý đơn hàng',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      path: '/admin/orders',
      color: '#f093fb'
    },
    {
      title: 'Khách hàng',
      description: 'Quản lý khách hàng',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/admin/customers',
      color: '#4facfe'
    },
    {
      title: 'Cài đặt',
      description: 'Cấu hình hệ thống',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/admin/settings',
      color: '#43e97b'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🍜 Admin Nhà Hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý hệ thống nhà hàng trực tuyến
        </Typography>
      </Box>

      {/* Admin Cards */}
      <Grid container spacing={3}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push(card.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box 
                  sx={{ 
                    color: card.color,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {card.description}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    backgroundColor: card.color,
                    '&:hover': {
                      backgroundColor: card.color,
                      opacity: 0.9
                    }
                  }}
                >
                  Truy cập
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Hành động nhanh
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/')}
          >
            Xem nhà hàng
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/admin/products')}
          >
            Thêm món ăn mới
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/admin/orders')}
          >
            Xem đơn hàng mới
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
