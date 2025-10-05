'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';
import { useNotification } from '@/hooks/useNotification';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  sku?: string;
  stock: number;
  images?: string;
  isActive?: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function CartPage() {
  const router = useRouter();
  const { notification, hideNotification, showSuccess, showError } = useNotification();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  const persistCart = (updated: CartItem[]) => {
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    );
    persistCart(updated);
  };

  const removeFromCart = (productId: number) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    const removed = cartItems.find((i) => i.product.id === productId)?.product;
    persistCart(updated);
    if (removed) {
      showSuccess('Đã xóa khỏi giỏ hàng', `${removed.name} đã được xóa khỏi giỏ hàng.`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    showSuccess('Đã xóa giỏ hàng', 'Tất cả sản phẩm đã được xóa khỏi giỏ hàng.');
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );
  const shipping = useMemo(() => (subtotal >= 500000 ? 0 : cartItems.length ? 30000 : 0), [subtotal, cartItems.length]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);
  const totalItems = useMemo(() => cartItems.reduce((sum, i) => sum + i.quantity, 0), [cartItems]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/')} sx={{ mr: 2 }}>
            Tiếp tục mua sắm
          </Button>
          <Typography variant="h4" component="h1">
            Giỏ hàng của bạn
          </Typography>
        </Box>
        {cartItems.length > 0 && (
          <Button variant="outlined" color="error" onClick={clearCart} startIcon={<DeleteIcon />}>
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
          <Button variant="contained" onClick={() => router.push('/')} startIcon={<ShoppingBagIcon />}>
            Bắt đầu mua sắm
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm ({totalItems} sản phẩm)
            </Typography>

            {cartItems.map((item) => (
              <Card key={item.product.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
                    <Box sx={{ width: { sm: 180 }, flexShrink: 0 }}>
                      <Box
                        sx={{
                          height: 120,
                          backgroundColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {item.product.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.product.description}
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        <Chip label={item.product.category} size="small" />
                        {item.product.brand && <Chip label={item.product.brand} size="small" variant="outlined" />}
                      </Box>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(item.product.price)}
                      </Typography>
                    </Box>

                    <Box sx={{ width: { sm: 220 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>
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
                        <IconButton size="small" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                          <AddIcon />
                        </IconButton>
                      </Box>

                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </Typography>

                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => removeFromCart(item.product.id)} fullWidth>
                        Xóa
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tóm tắt đơn hàng
                </Typography>

                <List>
                  {cartItems.map((item) => (
                    <ListItem key={item.product.id} sx={{ px: 0 }}>
                      <ListItemText primary={item.product.name} secondary={`Số lượng: ${item.quantity}`} />
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
                  <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Phí vận chuyển:</Typography>
                  <Typography variant="body2">{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h6" color="primary">{formatCurrency(total)}</Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
                <Button variant="contained" fullWidth size="large" onClick={() => router.push('/checkout')} disabled={cartItems.length === 0}>
                  Thanh toán
                </Button>
                <Button variant="outlined" fullWidth onClick={() => router.push('/')}>Tiếp tục mua sắm</Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
      )}

      <Notification
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Container>
  );
}
