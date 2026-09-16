import {
  LockOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/endpoints';
import { setSession } from '../auth/auth';
import { teal } from '../theme';

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await login(values.username, values.password);
      setSession(response);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: `linear-gradient(160deg, ${teal[50]} 0%, ${teal[100]} 55%, ${teal[200]} 100%)`,
      }}
    >
      <Card
        style={{ width: '100%', maxWidth: 400 }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <MedicineBoxOutlined style={{ fontSize: 44, color: teal[600] }} />
          <Typography.Title
            level={2}
            style={{ margin: '12px 0 4px', color: teal[700] }}
          >
            Jez Meds
          </Typography.Title>
          <Typography.Text type="secondary">
            Medicine Inventory System
          </Typography.Text>
        </div>

        {error && (
          <Alert
            type="error"
            title={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username.' }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="admin"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
