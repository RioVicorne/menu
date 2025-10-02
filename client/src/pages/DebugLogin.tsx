import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';

const DebugLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setResult(`✅ Đăng nhập thành công!\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Lỗi đăng nhập:\n${JSON.stringify(error.response?.data || error.message, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Debug Login
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleTestLogin}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Login'}
          </Button>
        </Box>

        {result && (
          <Alert severity={result.includes('✅') ? 'success' : 'error'}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {result}
            </pre>
          </Alert>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Thông tin đăng nhập mặc định:
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> admin@example.com<br />
            <strong>Password:</strong> admin123<br />
            <strong>Role:</strong> admin
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DebugLogin;

