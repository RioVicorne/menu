const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all customers with pagination and filtering
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (req.query.search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (req.query.isActive !== undefined) {
      whereClause += ' AND isActive = ?';
      params.push(req.query.isActive === 'true' ? 1 : 0);
    }

    // Get customers
    const customersQuery = `SELECT * FROM customers ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    db.all(customersQuery, [...params, limit, offset], (err, customers) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
      db.get(countQuery, params, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({
          customers,
          pagination: {
            current: page,
            pages: Math.ceil(result.total / limit),
            total: result.total
          }
        });
      });
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single customer
router.get('/:id', (req, res) => {
  try {
    db.get('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, customer) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json(customer);
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new customer
router.post('/', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const query = `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`;

    db.run(query, [name, email, phone, JSON.stringify(address)], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.status(201).json({
        message: 'Customer created successfully',
        customer: {
          id: this.lastID,
          name,
          email,
          phone,
          address
        }
      });
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update customer
router.put('/:id', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    const query = `UPDATE customers SET 
                   name = COALESCE(?, name),
                   email = COALESCE(?, email),
                   phone = COALESCE(?, phone),
                   address = COALESCE(?, address),
                   updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;

    db.run(query, [name, email, phone, JSON.stringify(address), req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({ message: 'Customer updated successfully' });
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({ message: 'Customer deleted successfully' });
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer statistics
router.get('/:id/stats', (req, res) => {
  try {
    db.get('SELECT totalOrders, totalSpent, lastOrderDate FROM customers WHERE id = ?', [req.params.id], (err, customer) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        lastOrderDate: customer.lastOrderDate,
        averageOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0
      });
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

