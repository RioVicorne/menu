'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Paper,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  DeliveryDining as DeliveryIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface CartItem {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    sku: string;
    stock: number;
    isActive: boolean;
  };
  quantity: number;
}

const steps = ['Giỏ hàng', 'Thông tin', 'Thanh toán'];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    updateCart(updatedCart);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    updateCart(updatedCart);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    return deliveryMethod === 'delivery' ? 15000 : 0;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryFee();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleNext = () => {
    if (activeStep === 0 && cart.length === 0) {
      setError('Giỏ hàng trống!');
      return;
    }
    if (activeStep === 1) {
      if (!customerInfo.name || !customerInfo.phone) {
        setError('Vui lòng điền đầy đủ thông tin khách hàng!');
        return;
      }
    }
    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmitOrder = () => {
    // Xử lý đặt hàng
    const order = {
      id: `ORD${Date.now()}`,
      customer: customerInfo,
      items: cart,
      paymentMethod,
      deliveryMethod,
      total: getFinalTotal(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log('Order submitted:', order);
    
    // Xóa giỏ hàng
    localStorage.removeItem('cart');
    setCart([]);
    
    alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
    router.push('/');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Giỏ hàng của bạn
            </Typography>
            {cart.length === 0 ? (
              <Alert severity="info">
                Giỏ hàng trống. <Button onClick={() => router.push('/')}>Quay về menu</Button>
              </Alert>
            ) : (
              <List>
                {cart.map((item) => (
                  <ListItem key={item.product.id} divider>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`${formatCurrency(item.product.price)} x ${item.quantity}`}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.product.description}
                    </Typography>
                    <ListItemSecondaryAction>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Thông tin khách hàng
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ và tên *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  multiline
                  rows={2}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú"
                  multiline
                  rows={2}
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Yêu cầu đặc biệt cho món ăn..."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Phương thức giao hàng
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              >
                <FormControlLabel
                  value="pickup"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <StoreIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Tự lấy tại nhà hàng</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Miễn phí - Thời gian chuẩn bị: 15-20 phút
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="delivery"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <DeliveryIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body1">Giao hàng tận nơi</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Phí giao hàng: {formatCurrency(15000)} - Thời gian: 30-45 phút
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Phương thức thanh toán
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <PaymentIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">Thanh toán khi nhận hàng</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="bank"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <PaymentIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">Chuyển khoản ngân hàng</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Tóm tắt đơn hàng
            </Typography>
            <Paper sx={{ p: 2 }}>
              <List dense>
                {cart.map((item) => (
                  <ListItem key={item.product.id}>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`${item.quantity} x ${formatCurrency(item.product.price)}`}
                    />
                    <Typography variant="body2">
                      {formatCurrency(item.product.price * item.quantity)}
                    </Typography>
                  </ListItem>
                ))}
                <Divider />
                <ListItem>
                  <ListItemText primary="Tạm tính" />
                  <Typography variant="body2">
                    {formatCurrency(getTotalPrice())}
                  </Typography>
                </ListItem>
                {getDeliveryFee() > 0 && (
                  <ListItem>
                    <ListItemText primary="Phí giao hàng" />
                    <Typography variant="body2">
                      {formatCurrency(getDeliveryFee())}
                    </Typography>
                  </ListItem>
                )}
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary={<Typography variant="h6">Tổng cộng</Typography>} 
                  />
                  <Typography variant="h6" color="primary">
                    {formatCurrency(getFinalTotal())}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom>
          🍜 Đặt hàng
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Quay lại
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmitOrder}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4
              }}
            >
              Đặt hàng ngay
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              Tiếp theo
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
