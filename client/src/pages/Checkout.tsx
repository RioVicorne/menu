import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  stock: number;
  images?: string;
  isActive: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Thông tin giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

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
      setError('Không thể tải giỏ hàng');
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const updatedCart = cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    switch (shippingMethod) {
      case 'standard':
        return 30000;
      case 'express':
        return 50000;
      case 'pickup':
        return 0;
      default:
        return 30000;
    }
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate customer info
      if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
        setError('Vui lòng điền đầy đủ thông tin giao hàng');
        return;
      }
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart
      localStorage.removeItem('cart');
      
      alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      navigate('/');
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Giỏ hàng trống
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Bạn chưa có sản phẩm nào trong giỏ hàng
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Tiếp tục mua sắm
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Quay lại cửa hàng
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Thanh toán
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin giao hàng
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      multiline
                      rows={2}
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Thành phố"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Quận/Huyện"
                      value={customerInfo.district}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, district: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Phường/Xã"
                      value={customerInfo.ward}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, ward: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Phương thức thanh toán
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="cod"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PaymentIcon sx={{ mr: 1 }} />
                          Thanh toán khi nhận hàng (COD)
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="bank"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PaymentIcon sx={{ mr: 1 }} />
                          Chuyển khoản ngân hàng
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PaymentIcon sx={{ mr: 1 }} />
                          Thẻ tín dụng/Ghi nợ
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Phương thức giao hàng
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="standard"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ShippingIcon sx={{ mr: 1 }} />
                            Giao hàng tiêu chuẩn (3-5 ngày)
                          </Box>
                          <Typography variant="body2" color="primary">
                            {formatCurrency(30000)}
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="express"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ShippingIcon sx={{ mr: 1 }} />
                            Giao hàng nhanh (1-2 ngày)
                          </Box>
                          <Typography variant="body2" color="primary">
                            {formatCurrency(50000)}
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="pickup"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ShippingIcon sx={{ mr: 1 }} />
                            Nhận tại cửa hàng
                          </Box>
                          <Typography variant="body2" color="success.main">
                            Miễn phí
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Xác nhận đơn hàng
                </Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Thông tin giao hàng
                  </Typography>
                  <Typography variant="body2">
                    <strong>{customerInfo.fullName}</strong><br />
                    {customerInfo.email}<br />
                    {customerInfo.phone}<br />
                    {customerInfo.address}
                    {customerInfo.city && `, ${customerInfo.city}`}
                    {customerInfo.district && `, ${customerInfo.district}`}
                    {customerInfo.ward && `, ${customerInfo.ward}`}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Phương thức thanh toán
                  </Typography>
                  <Typography variant="body2">
                    {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                    {paymentMethod === 'bank' && 'Chuyển khoản ngân hàng'}
                    {paymentMethod === 'card' && 'Thẻ tín dụng/Ghi nợ'}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Đơn hàng của bạn
              </Typography>
              <List>
                {cart.map((item) => (
                  <ListItem key={item.product.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`Số lượng: ${item.quantity}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2">
                        {formatCurrency(item.product.price * item.quantity)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tạm tính:</Typography>
                <Typography variant="body2">{formatCurrency(getSubtotal())}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Phí vận chuyển:</Typography>
                <Typography variant="body2">
                  {getShippingCost() === 0 ? 'Miễn phí' : formatCurrency(getShippingCost())}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(getTotal())}
                </Typography>
              </Box>
            </CardContent>
            
            <CardActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNext}
                >
                  Tiếp tục
                </Button>
              )}
              
              {activeStep === steps.length - 1 && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  startIcon={<CheckCircleIcon />}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
              )}
              
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBack}
                >
                  Quay lại
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;

