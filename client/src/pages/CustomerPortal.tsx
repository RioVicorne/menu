import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon
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

interface CartItem {
  product: Product;
  quantity: number;
}

const CustomerPortal: React.FC = () => {
  const navigate = useNavigate();
  const { notification, showSuccess, showWarning, hideNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadCustomer();
    loadCart();
    loadWishlist();
  }, []);

  const loadCustomer = () => {
    try {
      const savedCustomer = localStorage.getItem('customer');
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer));
      }
    } catch (err) {
      console.error('Failed to load customer info:', err);
    }
  };

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

  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const wishlistData = JSON.parse(savedWishlist);
        setWishlist(wishlistData.map((item: any) => item.product));
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products.filter((p: Product) => p.isActive));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories/list');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    showSuccess(
      'Đã thêm vào giỏ hàng!',
      `${product.name} đã được thêm vào giỏ hàng của bạn.`
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const addToWishlist = (product: Product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      const newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist.map(p => ({
        product: p,
        addedDate: new Date().toISOString()
      }))));
      showSuccess(
        'Đã thêm vào yêu thích!',
        `${product.name} đã được thêm vào danh sách yêu thích của bạn.`
      );
    } else {
      showWarning(
        'Sản phẩm đã có trong yêu thích',
        `${product.name} đã có trong danh sách yêu thích của bạn.`
      );
    }
  };

  const removeFromWishlist = (productId: number) => {
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist.map(p => ({
      product: p,
      addedDate: new Date().toISOString()
    }))));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  const logoutCustomer = () => {
    localStorage.removeItem('customer');
    setCustomer(null);
    alert('Đã đăng xuất thành công!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    return filtered;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
          >
            🛍️ Cửa hàng trực tuyến
          </Typography>
          
          {customer ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
                👋 Xin chào, {customer.name}!
              </Typography>
              <Button
                color="inherit"
                onClick={logoutCustomer}
                size="small"
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Đăng xuất
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              onClick={() => navigate('/customer-login')}
              sx={{ 
                mr: 2,
                borderRadius: 2,
                px: 3,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Đăng nhập
            </Button>
          )}
          
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/wishlist')}
            sx={{
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Badge badgeContent={wishlist.length} color="error">
              <FavoriteIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            color="inherit"
            onClick={() => navigate('/cart')}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Badge badgeContent={getTotalItems()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Danh mục
          </Typography>
          <List>
            <ListItem button onClick={() => setCategoryFilter('')}>
              <ListItemText primary="Tất cả" />
            </ListItem>
            {categories.map((category) => (
              <ListItem 
                key={category} 
                button 
                onClick={() => setCategoryFilter(category)}
              >
                <ListItemText primary={category} />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Advanced Filters */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Bộ lọc nâng cao
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Price Range */}
              <Typography variant="subtitle2" gutterBottom>
                Khoảng giá
              </Typography>
              <Slider
                value={priceRange}
                onChange={(event, newValue) => setPriceRange(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={10000000}
                step={100000}
                valueLabelFormat={(value) => formatCurrency(value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption">
                  {formatCurrency(priceRange[0])}
                </Typography>
                <Typography variant="caption">
                  {formatCurrency(priceRange[1])}
                </Typography>
              </Box>
              
              {/* Sort By */}
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp theo"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Tên A-Z</MenuItem>
                  <MenuItem value="price-low">Giá thấp đến cao</MenuItem>
                  <MenuItem value="price-high">Giá cao đến thấp</MenuItem>
                  <MenuItem value="stock">Tồn kho</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Giỏ hàng
          </Typography>
          {cart.length === 0 ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Giỏ hàng trống
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/cart')}
              >
                Xem giỏ hàng
              </Button>
            </Box>
          ) : (
            <Box>
              {cart.map((item) => (
                <Box key={item.product.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">{item.product.name}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      size="small"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <Typography variant="body2">{item.quantity}</Typography>
                    <Button
                      size="small"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">
                Tổng: {formatCurrency(getTotalPrice())}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1, mb: 1 }}
                onClick={() => navigate('/cart')}
              >
                Xem giỏ hàng
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/checkout')}
              >
                Thanh toán
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

          {/* Main Content */}
          <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
            {/* Search */}
            <Box display="flex" gap={2} mb={4}>
              <TextField
                placeholder="🔍 Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#667eea' }} />
                }}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

            {/* Products Grid */}
            <Grid container spacing={4}>
              {getFilteredAndSortedProducts().map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 220,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {product.category}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          }}
                        />
                      </CardMedia>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                        onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                      >
                        {isInWishlist(product.id) ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {product.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {product.description}
                      </Typography>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip 
                          label={product.category} 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            color: 'white',
                            fontWeight: 'bold',
                          }} 
                        />
                        {product.brand && (
                          <Chip 
                            label={product.brand} 
                            size="small" 
                            variant="outlined" 
                            sx={{ 
                              borderColor: '#667eea',
                              color: '#667eea',
                            }} 
                          />
                        )}
                      </Box>

                      <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 'bold', mb: 1 }}>
                        {formatCurrency(product.price)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        SKU: {product.sku}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: product.stock > 0 ? '#4caf50' : '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        {product.stock > 0 ? `✅ Còn ${product.stock} sản phẩm` : '❌ Hết hàng'}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ flexDirection: 'column', gap: 1, p: 3, pt: 0 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/product/${product.id}`)}
                        sx={{
                          borderRadius: 2,
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          },
                        }}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product)}
                        sx={{
                          borderRadius: 2,
                          background: product.stock > 0 
                            ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                            : 'grey.400',
                          '&:hover': {
                            background: product.stock > 0 
                              ? 'linear-gradient(45deg, #5a6fd8, #6a4190)' 
                              : 'grey.400',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {product.stock > 0 ? '🛒 Thêm vào giỏ' : 'Hết hàng'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

        {products.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy sản phẩm nào
            </Typography>
          </Box>
        )}
      </Box>

      {/* Notification Popup */}
      <Notification
        open={notification.open}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </Box>
  );
};

export default CustomerPortal;
