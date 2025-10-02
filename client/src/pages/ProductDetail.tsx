import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
  Rating,
  TextField,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AddShoppingCart as AddShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Compare as CompareIcon,
  Star as StarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
  sku: string;
  rating?: number;
  reviewCount?: number;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notification, showSuccess, showWarning, showError, hideNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      // Mock reviews data - in real app, this would come from API
      const mockReviews: Review[] = [
        {
          id: 1,
          userName: 'Nguyễn Văn A',
          rating: 5,
          comment: 'Sản phẩm rất tốt, chất lượng cao!',
          date: '2024-01-15'
        },
        {
          id: 2,
          userName: 'Trần Thị B',
          rating: 4,
          comment: 'Tốt nhưng giá hơi cao.',
          date: '2024-01-10'
        }
      ];
      setReviews(mockReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      try {
        // Load existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find((item: any) => item.product.id === product.id);
        
        let updatedCart;
        if (existingItem) {
          updatedCart = existingCart.map((item: any) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedCart = [...existingCart, { product, quantity }];
        }
        
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        showSuccess(
          'Đã thêm vào giỏ hàng!',
          `${quantity} x ${product.name} đã được thêm vào giỏ hàng của bạn.`
        );
        
        // Reset quantity to 1
        setQuantity(1);
      } catch (err) {
        showError(
          'Lỗi thêm vào giỏ hàng',
          'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.'
        );
      }
    }
  };

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
    if (product) {
      if (!isFavorite) {
        showSuccess(
          'Đã thêm vào yêu thích!',
          `${product.name} đã được thêm vào danh sách yêu thích của bạn.`
        );
      } else {
        showWarning(
          'Đã xóa khỏi yêu thích',
          `${product.name} đã được xóa khỏi danh sách yêu thích của bạn.`
        );
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link sản phẩm!');
    }
  };

  const handleSubmitReview = () => {
    // Submit review logic here
    console.log('New review:', newReview);
    setShowReviewDialog(false);
    setNewReview({ rating: 5, comment: '' });
    alert('Cảm ơn bạn đã đánh giá sản phẩm!');
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Quay lại cửa hàng
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Quay lại cửa hàng
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.imageUrl || 'https://via.placeholder.com/400'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip label={product.category} color="primary" />
                <Box>
                  <IconButton onClick={handleAddToFavorites} color={isFavorite ? 'error' : 'default'}>
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                  <IconButton>
                    <CompareIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating || 4.5} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.reviewCount || 12} đánh giá)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Product Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin sản phẩm
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="SKU" secondary={product.sku} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Danh mục" secondary={product.category} />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Tồn kho" 
                    secondary={product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'} 
                  />
                </ListItem>
              </List>
            </Box>

            {/* Quantity and Add to Cart */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1">Số lượng:</Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: product.stock }}
                sx={{ width: 80 }}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ flexGrow: 1 }}
              >
                {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowReviewDialog(true)}
              >
                Đánh giá
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Đánh giá sản phẩm
        </Typography>
        
        {reviews.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </Typography>
        ) : (
          <List>
            {reviews.map((review) => (
              <Paper key={review.id} sx={{ mb: 2, p: 2 }}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{review.userName}</Typography>
                        <Rating value={review.rating} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary">
                          {review.date}
                        </Typography>
                      </Box>
                    }
                    secondary={review.comment}
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Box>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Đánh giá của bạn:
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview({ ...newReview, rating: newValue || 5 });
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Nhận xét"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Hủy</Button>
          <Button onClick={handleSubmitReview} variant="contained">
            Gửi đánh giá
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

export default ProductDetail;
