import {
  DashboardOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../auth/auth';
import { teal } from '../theme';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/medicines', icon: <MedicineBoxOutlined />, label: 'Medicines' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" width={220}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '20px 16px',
            color: '#fff',
          }}
        >
          <Avatar
            size={36}
            style={{ backgroundColor: teal[500], flexShrink: 0 }}
            icon={<MedicineBoxOutlined />}
          />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Jez Meds</div>
            <div style={{ fontSize: 11, color: teal[300] }}>
              Inventory System
            </div>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 16,
            padding: '0 24px',
            borderBottom: `3px solid ${teal[600]}`,
          }}
        >
          <Typography.Text type="secondary">
            Signed in as <strong>{user?.displayName ?? 'User'}</strong>
          </Typography.Text>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Log out
          </Button>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
