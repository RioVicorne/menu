const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all products with pagination and filtering
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (req.query.category) {
      whereClause += ' AND category = ?';
      params.push(req.query.category);
    }
    
    if (req.query.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (req.query.isActive !== undefined) {
      whereClause += ' AND isActive = ?';
      params.push(req.query.isActive === 'true' ? 1 : 0);
    }

    // Get products
    const productsQuery = `SELECT * FROM products ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    db.all(productsQuery, [...params, limit, offset], (err, products) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
      db.get(countQuery, params, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({
          products,
          pagination: {
            current: page,
            pages: Math.ceil(result.total / limit),
            total: result.total
          }
        });
      });
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/', (req, res) => {
  try {
    const { name, description, price, cost, category, brand, stock, minStock, isActive = true } = req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Generate SKU if not provided
    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const query = `INSERT INTO products (name, description, price, cost, category, brand, sku, stock, minStock, isActive) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [name, description, price, cost, category, brand, sku, stock, minStock, isActive ? 1 : 0], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.status(201).json({
        message: 'Product created successfully',
        product: {
          id: this.lastID,
          name,
          description,
          price,
          cost,
          category,
          brand,
          sku,
          stock,
          minStock,
          isActive
        }
      });
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', (req, res) => {
  try {
    const { name, description, price, cost, category, brand, stock, minStock, isActive } = req.body;
    
    const query = `UPDATE products SET 
                   name = COALESCE(?, name),
                   description = COALESCE(?, description),
                   price = COALESCE(?, price),
                   cost = COALESCE(?, cost),
                   category = COALESCE(?, category),
                   brand = COALESCE(?, brand),
                   stock = COALESCE(?, stock),
                   minStock = COALESCE(?, minStock),
                   isActive = COALESCE(?, isActive),
                   updatedAt = CURRENT_TIMESTAMP
                   WHERE id = ?`;

    db.run(query, [name, description, price, cost, category, brand, stock, minStock, isActive, req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product updated successfully' });
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product categories
router.get('/categories/list', (req, res) => {
  try {
    db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL', [], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      const categories = rows.map(row => row.category);
      res.json(categories);
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products
router.get('/alerts/low-stock', (req, res) => {
  try {
    db.all('SELECT * FROM products WHERE stock <= minStock AND isActive = 1', [], (err, products) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json(products);
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
