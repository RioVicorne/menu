const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all orders with pagination and filtering
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (req.query.status) {
      whereClause += ' AND status = ?';
      params.push(req.query.status);
    }
    
    if (req.query.paymentStatus) {
      whereClause += ' AND paymentStatus = ?';
      params.push(req.query.paymentStatus);
    }
    
    if (req.query.search) {
      whereClause += ' AND (orderNumber LIKE ? OR customerId IN (SELECT id FROM customers WHERE name LIKE ?))';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get orders with customer info
    const ordersQuery = `
      SELECT o.*, c.name as customerName, c.email as customerEmail, c.phone as customerPhone,
             u.username as createdByName
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      LEFT JOIN users u ON o.createdBy = u.id
      ${whereClause}
      ORDER BY o.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(ordersQuery, [...params, limit, offset], (err, orders) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Parse items JSON for each order
      orders.forEach(order => {
        try {
          order.items = JSON.parse(order.items);
        } catch (e) {
          order.items = [];
        }
      });

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
      db.get(countQuery, params, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({
          orders,
          pagination: {
            current: page,
            pages: Math.ceil(result.total / limit),
            total: result.total
          }
        });
      });
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', (req, res) => {
  try {
    const query = `
      SELECT o.*, c.name as customerName, c.email as customerEmail, c.phone as customerPhone,
             u.username as createdByName
      FROM orders o
      LEFT JOIN customers c ON o.customerId = c.id
      LEFT JOIN users u ON o.createdBy = u.id
      WHERE o.id = ?
    `;
    
    db.get(query, [req.params.id], (err, order) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Parse items JSON
      try {
        order.items = JSON.parse(order.items);
      } catch (e) {
        order.items = [];
      }

      res.json(order);
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', (req, res) => {
  try {
    const { customerId, items, tax = 0, discount = 0, paymentMethod, shippingAddress, notes } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer ID and items are required' });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      processedItems.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal
      });
    }

    const total = subtotal + tax - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const query = `INSERT INTO orders (orderNumber, customerId, items, subtotal, tax, discount, total, paymentMethod, shippingAddress, notes, createdBy) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
      orderNumber,
      customerId,
      JSON.stringify(processedItems),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      JSON.stringify(shippingAddress),
      notes,
      1 // Default createdBy user ID
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: this.lastID,
          orderNumber,
          customerId,
          items: processedItems,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          shippingAddress,
          notes
        }
      });
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const query = `UPDATE orders SET 
                   status = COALESCE(?, status),
                   paymentStatus = COALESCE(?, paymentStatus),
                   updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;

    db.run(query, [status, paymentStatus, req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json({ message: 'Order status updated successfully' });
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics
router.get('/stats/overview', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const queries = [
      `SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(createdAt) = ?`,
      `SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(createdAt) >= ?`,
      `SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(createdAt) >= ?`,
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total), 0) as totalRevenue, COALESCE(AVG(total), 0) as averageOrderValue FROM orders`,
      `SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'`
    ];

    const params = [today, startOfMonth, startOfYear];

    Promise.all([
      new Promise((resolve, reject) => {
        db.get(queries[0], [today], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        db.get(queries[1], [startOfMonth], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        db.get(queries[2], [startOfYear], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        db.get(queries[3], [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }),
      new Promise((resolve, reject) => {
        db.get(queries[4], [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      })
    ]).then(([todayStats, monthStats, yearStats, totalStats, pendingStats]) => {
      res.json({
        todayOrders: todayStats.orders,
        monthOrders: monthStats.orders,
        yearOrders: yearStats.orders,
        totalOrders: totalStats.totalOrders,
        pendingOrders: pendingStats.pendingOrders,
        totalRevenue: totalStats.totalRevenue
      });
    }).catch(err => {
      console.error('Get order stats error:', err);
      res.status(500).json({ message: 'Server error' });
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

