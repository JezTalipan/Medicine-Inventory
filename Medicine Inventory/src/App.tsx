import { App as AntdApp, ConfigProvider } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import RequireAuth from './auth/RequireAuth';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MedicinesPage from './pages/MedicinesPage';
import { antdTheme } from './theme';

const App = () => (
  <ConfigProvider theme={antdTheme}>
    <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/medicines" element={<MedicinesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
);

export default App;
