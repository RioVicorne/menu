# Hệ thống Quản lý Bán hàng

Một ứng dụng web full-stack để quản lý bán hàng với các tính năng cơ bản như quản lý sản phẩm, đơn hàng, khách hàng và dashboard thống kê.

## Công nghệ sử dụng

### Backend

- **Node.js** với **Express.js**
- **MongoDB** với **Mongoose**
- **JWT** cho authentication
- **Express Validator** cho validation
- **Bcryptjs** cho mã hóa mật khẩu

### Frontend

- **React** với **TypeScript**
- **Material-UI** cho giao diện
- **React Router** cho routing
- **Axios** cho API calls
- **Recharts** cho biểu đồ

## Tính năng

### 🔐 Authentication

- Đăng ký/Đăng nhập người dùng
- JWT token authentication
- Phân quyền người dùng (admin, manager, employee)

### 📦 Quản lý Sản phẩm

- Thêm, sửa, xóa sản phẩm
- Tìm kiếm và lọc sản phẩm
- Quản lý tồn kho và cảnh báo hết hàng
- Phân loại sản phẩm theo danh mục

### 🛒 Quản lý Đơn hàng

- Tạo và quản lý đơn hàng
- Theo dõi trạng thái đơn hàng
- Quản lý thanh toán
- Chi tiết đơn hàng với sản phẩm

### 👥 Quản lý Khách hàng

- Thông tin khách hàng đầy đủ
- Lịch sử mua hàng
- Thống kê chi tiêu

### 📊 Dashboard

- Thống kê tổng quan
- Biểu đồ doanh thu
- Sản phẩm bán chạy
- Cảnh báo tồn kho

## Cài đặt và Chạy

### Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MongoDB
- npm hoặc yarn

### Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd sales-management-system
```

2. **Cài đặt dependencies**

```bash
npm run install-all
```

3. **Cấu hình MongoDB**

- Đảm bảo MongoDB đang chạy
- Cập nhật connection string trong `server/.env` nếu cần

4. **Chạy ứng dụng**

**Chạy cả frontend và backend:**

```bash
npm run dev
```

**Hoặc chạy riêng lẻ:**

Backend:

```bash
npm run server
```

Frontend:

```bash
npm run client
```

### Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Cấu trúc dự án

```
sales-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.tsx
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
└── package.json          # Root package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user

### Products

- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Orders

- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

### Customers

- `GET /api/customers` - Lấy danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/:id` - Cập nhật khách hàng

### Dashboard

- `GET /api/dashboard/overview` - Thống kê tổng quan
- `GET /api/dashboard/sales-chart` - Dữ liệu biểu đồ

## Tài khoản mặc định

Sau khi chạy ứng dụng lần đầu, bạn có thể đăng ký tài khoản admin mới hoặc tạo tài khoản test.

## Phát triển thêm

### Tính năng có thể thêm:

- Quản lý nhà cung cấp
- Báo cáo chi tiết
- Tích hợp thanh toán
- Quản lý kho hàng
- Mobile app
- Email notifications

### Cải thiện:

- Unit tests
- E2E tests
- Docker containerization
- CI/CD pipeline
- Performance optimization

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## License

MIT License
