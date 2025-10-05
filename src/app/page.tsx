'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
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
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        setWishlist(wishlistData.map((item: { product: Product }) => item.product));
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      params.append('sortBy', sortBy);

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, priceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadCart();
    loadWishlist();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data);
    } catch (err: unknown) {
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
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  const addToWishlist = (product: Product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      const newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist.map(p => ({
        product: p,
        addedDate: new Date().toISOString()
      }))));
      alert(`${product.name} đã được thêm vào danh sách yêu thích!`);
    } else {
      alert(`${product.name} đã có trong danh sách yêu thích!`);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice && product.isActive;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🍜 Menu Store - Nhà Hàng
          </Typography>
          
          <TextField
            size="small"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
          
          <IconButton 
            color="inherit" 
            onClick={() => router.push('/wishlist')}
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
            onClick={() => router.push('/cart')}
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
            <ListItem 
              onClick={() => setCategoryFilter('')}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
            >
              <ListItemText primary="Tất cả" />
            </ListItem>
            {categories.map((category) => (
              <ListItem 
                key={category} 
                onClick={() => setCategoryFilter(category)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
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
                onClick={() => router.push('/cart')}
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
                      onClick={() => {
                        const updatedCart = cart.map(cartItem =>
                          cartItem.product.id === item.product.id
                            ? { ...cartItem, quantity: cartItem.quantity - 1 }
                            : cartItem
                        ).filter(cartItem => cartItem.quantity > 0);
                        setCart(updatedCart);
                        localStorage.setItem('cart', JSON.stringify(updatedCart));
                      }}
                    >
                      -
                    </Button>
                    <Typography variant="body2">{item.quantity}</Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        const updatedCart = cart.map(cartItem =>
                          cartItem.product.id === item.product.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                        );
                        setCart(updatedCart);
                        localStorage.setItem('cart', JSON.stringify(updatedCart));
                      }}
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
                onClick={() => router.push('/cart')}
              >
                Xem giỏ hàng
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push('/checkout')}
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🍜 Menu Nhà Hàng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Khám phá những món ăn ngon truyền thống Việt Nam
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Món ăn ({sortedProducts.length})
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {sortedProducts.map((product) => (
                <Box key={product.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)' } }}>
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
                        {product.name}
                      </Typography>
                    </CardMedia>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {product.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description}
                      </Typography>
                      
                      <Box display="flex" gap={1} mb={1}>
                        <Chip label={product.category} size="small" />
                        {product.brand && (
                          <Chip label={product.brand} size="small" variant="outlined" />
                        )}
                      </Box>
                      
                      <Typography variant="h6" color="primary">
                        {formatCurrency(product.price)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        SKU: {product.sku}
                      </Typography>
                      
                      <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'}>
                        {product.stock > 0 ? `Còn ${product.stock} phần` : 'Hết món'}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        fullWidth
                        startIcon={<FavoriteIcon color="error" />}
                        onClick={() => addToWishlist(product)}
                      >
                        Yêu thích
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product)}
                      >
                        {product.stock > 0 ? '🍽️ Thêm vào giỏ' : 'Hết món'}
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>

            {sortedProducts.length === 0 && !loading && (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  Không tìm thấy món ăn nào
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
