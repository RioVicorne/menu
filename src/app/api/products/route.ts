import { NextRequest, NextResponse } from 'next/server';

// Mock data - trong thực tế sẽ kết nối với database
const products = [
  {
    id: 1,
    name: 'Phở Bò Tái',
    description: 'Phở bò tái truyền thống với nước dùng đậm đà, thịt bò tươi ngon',
    price: 65000,
    category: 'Phở',
    brand: 'Nhà hàng ABC',
    sku: 'PHO001',
    stock: 50,
    isActive: true,
  },
  {
    id: 2,
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả đặc sản Hà Nội với thịt nướng thơm lừng',
    price: 55000,
    category: 'Bún',
    brand: 'Nhà hàng ABC',
    sku: 'BUN001',
    stock: 30,
    isActive: true,
  },
  {
    id: 3,
    name: 'Cơm Tấm Sài Gòn',
    description: 'Cơm tấm với sườn nướng, chả, trứng và đồ chua',
    price: 45000,
    category: 'Cơm',
    brand: 'Nhà hàng ABC',
    sku: 'COM001',
    stock: 40,
    isActive: true,
  },
  {
    id: 4,
    name: 'Bánh Mì Thịt Nướng',
    description: 'Bánh mì với thịt nướng, pate, rau thơm và gia vị',
    price: 25000,
    category: 'Bánh Mì',
    brand: 'Nhà hàng ABC',
    sku: 'BANH001',
    stock: 60,
    isActive: true,
  },
  {
    id: 5,
    name: 'Chả Cá Lã Vọng',
    description: 'Chả cá truyền thống với nghệ, thì là và mắm tôm',
    price: 120000,
    category: 'Món Đặc Biệt',
    brand: 'Nhà hàng ABC',
    sku: 'CHA001',
    stock: 15,
    isActive: true,
  },
  {
    id: 6,
    name: 'Nem Nướng Nha Trang',
    description: 'Nem nướng đặc sản Nha Trang với bánh tráng và rau sống',
    price: 85000,
    category: 'Món Đặc Biệt',
    brand: 'Nhà hàng ABC',
    sku: 'NEM001',
    stock: 25,
    isActive: true,
  }
];


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000');
    const sortBy = searchParams.get('sortBy') || 'name';

    const filteredProducts = products.filter(product => {
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || product.category === category;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesPrice && product.isActive;
    });

    // Sort products
    filteredProducts.sort((a, b) => {
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

    return NextResponse.json(filteredProducts);
  } catch {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
