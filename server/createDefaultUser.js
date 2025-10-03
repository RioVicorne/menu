const bcrypt = require('bcryptjs');
const db = require('./database');

// Admin credentials
const ADMIN_EMAIL = 'khoatran.payment@gmail.com';
const ADMIN_PASSWORD = 'Toppaine@123';
const ADMIN_USERNAME = 'admin';

// Create default admin user
async function createDefaultUser() {
  try {
    // Check if any users exist
    db.get('SELECT COUNT(*) as count FROM users', [], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      if (result.count === 0) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
        
        db.run('INSERT INTO users (username, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)', 
          [ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword, 'admin', 1], function(err) {
            if (err) {
              console.error('Error creating default user:', err);
            } else {
              console.log('✅ Default admin user created:');
              console.log(`   Username: ${ADMIN_USERNAME}`);
              console.log(`   Email: ${ADMIN_EMAIL}`);
              console.log(`   Password: ${ADMIN_PASSWORD}`);
              console.log('   Role: admin');
            }
          });
      } else {
        console.log('Users already exist in database');
      }
    });
  } catch (error) {
    console.error('Error creating default user:', error);
  }
}

module.exports = createDefaultUser;
