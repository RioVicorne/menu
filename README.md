# Menu Store - Next.js Version

Dự án cửa hàng trực tuyến được chuyển đổi từ React sang Next.js với App Router.

## 🚀 Tính năng

- **Next.js 15** với App Router
- **TypeScript** cho type safety
- **Material-UI** cho UI components
- **Tailwind CSS** cho styling
- **API Routes** cho backend
- **Responsive Design**

## 📁 Cấu trúc dự án

```
menu-nextjs/
├── src/
│   ├── app/                    # App Router
│   │   ├── api/               # API routes
│   │   │   └── products/      # Products API
│   │   ├── cart/              # Cart page
│   │   ├── wishlist/          # Wishlist page
│   │   ├── product/[id]/      # Product detail page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   ├── hooks/                 # Custom hooks
│   └── contexts/              # React contexts
├── server/                    # Backend server (SQLite)
└── public/                    # Static assets
```

## 🛠️ Cài đặt và chạy

### Frontend (Next.js)

```bash
cd menu-nextjs
npm install
npm run dev
```

### Backend (Node.js)

```bash
cd server
npm install
npm start
```

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **API:** http://localhost:3000/api/products

## 📱 Trang chính

- **Trang chủ:** `/` - Hiển thị danh sách sản phẩm
- **Giỏ hàng:** `/cart` - Quản lý giỏ hàng
- **Yêu thích:** `/wishlist` - Danh sách sản phẩm yêu thích
- **Chi tiết sản phẩm:** `/product/[id]` - Thông tin chi tiết sản phẩm

## 🔧 API Endpoints

- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/categories` - Lấy danh mục sản phẩm

## 🎨 Styling

- **Material-UI** cho components
- **Tailwind CSS** cho utility classes
- **Custom theme** với màu sắc brand

## 📦 Dependencies chính

- `next` - Next.js framework
- `react` - React library
- `@mui/material` - Material-UI components
- `@emotion/react` - CSS-in-JS
- `axios` - HTTP client
- `recharts` - Charts library

## 🚧 Đang phát triển

- [ ] Hoàn thiện trang giỏ hàng
- [ ] Hoàn thiện trang yêu thích
- [ ] Hoàn thiện trang chi tiết sản phẩm
- [ ] Thêm authentication
- [ ] Thêm checkout process
- [ ] Thêm admin dashboard

## 📝 Ghi chú

Dự án này được chuyển đổi từ React Create React App sang Next.js để tận dụng:

- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes tích hợp
- Performance tốt hơn
- SEO friendly
