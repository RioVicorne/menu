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
  Badge,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

interface WishlistItem {
  product: Product;
  addedDate: string;
}

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (err) {
      setError('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId: number) => {
    const updatedWishlist = wishlistItems.filter(item => item.product.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const addToCart = (product: Product) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = existingCart.find((item: any) => item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        existingCart.push({ product, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(existingCart));
      showSuccess(
        'Đã thêm vào giỏ hàng!',
        `${product.name} đã được thêm vào giỏ hàng của bạn.`
      );
    } catch (err) {
      showError(
        'Lỗi thêm vào giỏ hàng',
        'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.'
      );
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
    setShowClearDialog(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Danh sách yêu thích
        </Typography>
        {wishlistItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowClearDialog(true)}
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

      {wishlistItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <FavoriteBorderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Danh sách yêu thích trống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm sản phẩm yêu thích để xem lại sau này
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn có {wishlistItems.length} sản phẩm trong danh sách yêu thích
          </Typography>

          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      backgroundColor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      {item.product.name}
                    </Typography>
                  </CardMedia>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
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
                    
                    <Typography variant="body2" color="text.secondary">
                      SKU: {item.product.sku}
                    </Typography>
                    
                    <Typography variant="body2" color={item.product.stock > 0 ? 'success.main' : 'error.main'}>
                      {item.product.stock > 0 ? `Còn ${item.product.stock} sản phẩm` : 'Hết hàng'}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Thêm vào: {new Date(item.addedDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/product/${item.product.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      disabled={item.product.stock === 0}
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => addToCart(item.product)}
                    >
                      {item.product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      fullWidth
                      startIcon={<DeleteIcon />}
                      onClick={() => removeFromWishlist(item.product.id)}
                    >
                      Xóa khỏi yêu thích
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Clear Wishlist Dialog */}
      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>Xóa tất cả sản phẩm yêu thích?</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích? 
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>Hủy</Button>
          <Button onClick={clearWishlist} color="error" variant="contained">
            Xóa tất cả
          </Button>
        </DialogActions>
      </Dialog>

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

export default Wishlist;
