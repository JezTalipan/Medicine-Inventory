import {
  AlertOutlined,
  DollarOutlined,
  DownloadOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { downloadReport, getDashboardSummary } from '../api/endpoints';
import { teal } from '../theme';
import type { DashboardSummary, StockLevel } from '../types';
import { LOW_STOCK_THRESHOLD } from '../types';
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from '../utils/format';

const CHART_HEIGHT = 300;
const AXIS_TICK = { fill: '#64748b', fontSize: 12 };
const GRID_COLOR = '#e2e8f0';
const LOW_STOCK_COLOR = '#dc2626';

/** Recharts tooltip payload is loosely typed; these are the shapes we render. */
interface TooltipEntry {
  name?: string;
  value?: number | string;
  payload?: Record<string, unknown>;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter: (entry: TooltipEntry) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${GRID_COLOR}`,
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((entry, index) => (
        <div key={index} style={{ color: '#475569', fontSize: 13 }}>
          {formatter(entry)}
        </div>
      ))}
    </div>
  );
}

/**
 * Bar shape for the stock chart: low-stock medicines are drawn in the status
 * red so they stand out from the teal in-stock bars.
 */
function StockBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: StockLevel;
}) {
  const isLow = (props.payload?.quantity ?? 0) < LOW_STOCK_THRESHOLD;

  return (
    <Rectangle
      {...props}
      radius={[4, 4, 0, 0]}
      fill={isLow ? LOW_STOCK_COLOR : teal[600]}
    />
  );
}

export default function DashboardPage() {
  const { message } = App.useApp();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await getDashboardSummary());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load the dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReport();
      message.success('Report downloaded.');
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : 'Failed to download the report.',
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Alert
        type="error"
        showIcon
        title="Could not load the dashboard"
        description={error}
        action={
          <Button size="small" onClick={() => void loadSummary()}>
            Retry
          </Button>
        }
      />
    );
  }

  const salesData = summary.salesOverTime.map((point) => ({
    ...point,
    label: dayjs(point.date).format('MMM D'),
  }));

  const hasLowStock = summary.stockLevels.some(
    (s) => s.quantity < LOW_STOCK_THRESHOLD,
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Dashboard
        </Typography.Title>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void loadSummary()}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={() => void handleDownload()}
          >
            Download report
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Total medicines"
              value={summary.totalMedicines}
              prefix={<MedicineBoxOutlined style={{ color: teal[600] }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Stock value"
              value={formatCurrency(summary.totalStockValue)}
              prefix={<DollarOutlined style={{ color: teal[600] }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Total sales revenue"
              value={formatCurrency(summary.totalSalesRevenue)}
              prefix={<RiseOutlined style={{ color: teal[600] }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title={`Low stock (under ${LOW_STOCK_THRESHOLD})`}
              value={summary.lowStockCount}
              prefix={
                <AlertOutlined
                  style={{
                    color:
                      summary.lowStockCount > 0 ? LOW_STOCK_COLOR : teal[600],
                  }}
                />
              }
              styles={
                summary.lowStockCount > 0
                  ? { content: { color: LOW_STOCK_COLOR } }
                  : undefined
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Sales revenue — last 30 days">
            {salesData.length === 0 ? (
              <Typography.Text type="secondary">
                No sales recorded yet.
              </Typography.Text>
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <AreaChart
                  data={salesData}
                  margin={{ top: 8, right: 28, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={teal[600]}
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="100%"
                        stopColor={teal[600]}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: GRID_COLOR }}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatCompactCurrency}
                    width={56}
                  />
                  <Tooltip
                    cursor={{ stroke: teal[400], strokeWidth: 1 }}
                    content={
                      <ChartTooltip
                        formatter={(entry) => {
                          const units = entry.payload?.unitsSold as
                            number | undefined;
                          return `${formatCurrency(Number(entry.value ?? 0))} · ${formatNumber(units ?? 0)} units`;
                        }}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={teal[600]}
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title="Stock levels"
            extra={
              hasLowStock ? (
                <Typography.Text
                  style={{ color: LOW_STOCK_COLOR, fontSize: 12 }}
                >
                  ● Low stock
                </Typography.Text>
              ) : null
            }
          >
            {summary.stockLevels.length === 0 ? (
              <Typography.Text type="secondary">
                No medicines yet.
              </Typography.Text>
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart
                  data={summary.stockLevels}
                  margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: GRID_COLOR }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: teal[50] }}
                    content={
                      <ChartTooltip
                        formatter={(entry) =>
                          `${formatNumber(Number(entry.value ?? 0))} in stock`
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="quantity"
                    isAnimationActive={false}
                    shape={<StockBar />}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="Top-selling medicines">
            {summary.topSelling.length === 0 ? (
              <Typography.Text type="secondary">
                No sales recorded yet.
              </Typography.Text>
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart
                  layout="vertical"
                  data={summary.topSelling}
                  margin={{ top: 8, right: 48, bottom: 0, left: 8 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <Tooltip
                    cursor={{ fill: teal[50] }}
                    content={
                      <ChartTooltip
                        formatter={(entry) => {
                          const revenue = entry.payload?.revenue as
                            number | undefined;
                          return `${formatNumber(Number(entry.value ?? 0))} units · ${formatCurrency(revenue ?? 0)}`;
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="unitsSold"
                    fill={teal[600]}
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="unitsSold"
                      position="right"
                      style={{ fill: '#475569', fontSize: 12 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
