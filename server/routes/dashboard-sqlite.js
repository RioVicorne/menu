const express = require('express');
const db = require('../database');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    // Get today's statistics
    db.get(`SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue 
            FROM orders WHERE DATE(createdAt) = ?`, [today], (err, todayStats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Get month's statistics
      db.get(`SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue 
              FROM orders WHERE DATE(createdAt) >= ?`, [startOfMonth], (err, monthStats) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        // Get year's statistics
        db.get(`SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue 
                FROM orders WHERE DATE(createdAt) >= ?`, [startOfYear], (err, yearStats) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          // Get total statistics
          db.get(`SELECT COUNT(*) as totalOrders, COALESCE(SUM(total), 0) as totalRevenue, 
                  COALESCE(AVG(total), 0) as averageOrderValue FROM orders`, [], (err, totalStats) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error' });
            }

            // Get customer count
            db.get('SELECT COUNT(*) as totalCustomers FROM customers WHERE isActive = 1', [], (err, customerStats) => {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
              }

              // Get low stock products
              db.all('SELECT COUNT(*) as count FROM products WHERE stock <= minStock AND isActive = 1', [], (err, lowStockResult) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ message: 'Server error' });
                }

                // Get recent orders
                db.all(`SELECT o.orderNumber, o.total, c.name as customerName, o.createdAt
                        FROM orders o
                        LEFT JOIN customers c ON o.customerId = c.id
                        ORDER BY o.createdAt DESC
                        LIMIT 5`, [], (err, recentOrders) => {
                  if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                  }

                  res.json({
                    today: {
                      orders: todayStats.orders,
                      revenue: todayStats.revenue
                    },
                    month: {
                      orders: monthStats.orders,
                      revenue: monthStats.revenue
                    },
                    year: {
                      orders: yearStats.orders,
                      revenue: yearStats.revenue
                    },
                    total: {
                      orders: totalStats.totalOrders,
                      revenue: totalStats.totalRevenue,
                      averageOrderValue: totalStats.averageOrderValue,
                      customers: customerStats.totalCustomers
                    },
                    alerts: {
                      lowStockProducts: lowStockResult.length > 0 ? lowStockResult[0].count : 0
                    },
                    recentOrders: recentOrders.map(order => ({
                      orderNumber: order.orderNumber,
                      customer: { name: order.customerName },
                      total: order.total,
                      createdAt: order.createdAt
                    })),
                    topProducts: [] // Will be implemented later
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales chart data
router.get('/sales-chart', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    db.all(`SELECT DATE(createdAt) as date, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
            FROM orders
            WHERE DATE(createdAt) >= ? AND status != 'cancelled'
            GROUP BY DATE(createdAt)
            ORDER BY date`, [startDateStr], (err, salesData) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Format data for chart
      const formattedData = salesData.map(item => ({
        _id: {
          year: new Date(item.date).getFullYear(),
          month: new Date(item.date).getMonth() + 1,
          day: new Date(item.date).getDate()
        },
        orders: item.orders,
        revenue: item.revenue
      }));

      res.json(formattedData);
    });
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get revenue by category
router.get('/revenue-by-category', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // This is a simplified version - in a real app you'd need to join with products
    db.all(`SELECT 'Electronics' as category, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
            FROM orders
            WHERE DATE(createdAt) >= ? AND status != 'cancelled'
            LIMIT 1`, [startDateStr], (err, categoryRevenue) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json(categoryRevenue);
    });
  } catch (error) {
    console.error('Revenue by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

