const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      todayStats,
      monthStats,
      yearStats,
      totalStats,
      lowStockProducts,
      recentOrders,
      topProducts
    ] = await Promise.all([
      // Today's statistics
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        }
      ]),

      // This month's statistics
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        }
      ]),

      // This year's statistics
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        }
      ]),

      // Total statistics
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]),

      // Low stock products
      Product.find({
        $expr: { $lte: ['$stock', '$minStock'] },
        isActive: true
      }).limit(5),

      // Recent orders
      Order.find()
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(5),

      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.total' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ])
    ]);

    // Get customer count
    const totalCustomers = await Customer.countDocuments({ isActive: true });

    res.json({
      today: {
        orders: todayStats[0]?.orders || 0,
        revenue: todayStats[0]?.revenue || 0
      },
      month: {
        orders: monthStats[0]?.orders || 0,
        revenue: monthStats[0]?.revenue || 0
      },
      year: {
        orders: yearStats[0]?.orders || 0,
        revenue: yearStats[0]?.revenue || 0
      },
      total: {
        orders: totalStats[0]?.totalOrders || 0,
        revenue: totalStats[0]?.totalRevenue || 0,
        averageOrderValue: totalStats[0]?.averageOrderValue || 0,
        customers: totalCustomers
      },
      alerts: {
        lowStockProducts: lowStockProducts.length
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales chart data
router.get('/sales-chart', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get revenue by category
router.get('/revenue-by-category', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const categoryRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(categoryRevenue);
  } catch (error) {
    console.error('Revenue by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
