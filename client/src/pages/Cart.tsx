import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';

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

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    const product = cartItems.find(item => item.product.id === productId)?.product;
    if (product) {
      showSuccess(
        'Đã xóa khỏi giỏ hàng',
        `${product.name} đã được xóa khỏi giỏ hàng của bạn.`
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    showSuccess(
      'Đã xóa giỏ hàng',
      'Tất cả sản phẩm đã được xóa khỏi giỏ hàng.'
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    return subtotal >= 500000 ? 0 : 30000; // Free shipping over 500k
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

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Tiếp tục mua sắm
          </Button>
          <Typography variant="h4" component="h1">
            Giỏ hàng của bạn
          </Typography>
        </Box>
        {cartItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={clearCart}
            startIcon={<DeleteIcon />}
          >
            Xóa tất cả
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Giỏ hàng trống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<ShoppingBagIcon />}
          >
            Bắt đầu mua sắm
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm ({getTotalItems()} sản phẩm)
            </Typography>
            
            {cartItems.map((item) => (
              <Card key={item.product.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box
                        sx={{
                          height: 120,
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {item.product.name}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.product.description}
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        <Chip label={item.product.category} size="small" />
                        {item.product.brand && (
                          <Chip label={item.product.brand} size="small" variant="outlined" />
                        )}
                      </Box>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(item.product.price)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1, max: item.product.stock }}
                          sx={{ width: 60 }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </Typography>
                      
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeFromCart(item.product.id)}
                        fullWidth
                      >
                        Xóa
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tóm tắt đơn hàng
                </Typography>
                
                <List>
                  {cartItems.map((item) => (
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
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0}
                >
                  Thanh toán
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Tiếp tục mua sắm
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Notification Popup */}
      <Notification
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Container>
  );
};

export default Cart;

