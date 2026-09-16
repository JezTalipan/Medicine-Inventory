import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createMedicine,
  deleteMedicine,
  downloadReport,
  getMedicines,
  recordSale,
  updateMedicine,
} from '../api/endpoints';
import MedicineFormModal from '../components/MedicineFormModal';
import RecordSaleModal from '../components/RecordSaleModal';
import { teal } from '../theme';
import {
  LOW_STOCK_THRESHOLD,
  type Medicine,
  type MedicineUpsert,
} from '../types';
import { formatCurrency, formatNumber } from '../utils/format';

/** Medicines expiring within this window are flagged in the table. */
const EXPIRY_WARNING_DAYS = 90;

export default function MedicinesPage() {
  const { message } = App.useApp();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [saleOpen, setSaleOpen] = useState(false);
  const [sellingMedicine, setSellingMedicine] = useState<Medicine | null>(null);

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    try {
      setMedicines(await getMedicines());
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : 'Failed to load medicines.',
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadMedicines();
  }, [loadMedicines]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return medicines;

    return medicines.filter((m) =>
      [m.name, m.genericName, m.category, m.supplier]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    );
  }, [medicines, search]);

  const handleSave = async (values: MedicineUpsert) => {
    setSaving(true);
    try {
      if (editing) {
        await updateMedicine(editing.id, values);
        message.success(`${values.name} updated.`);
      } else {
        await createMedicine(values);
        message.success(`${values.name} added.`);
      }
      setFormOpen(false);
      setEditing(null);
      await loadMedicines();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : 'Failed to save the medicine.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicine: Medicine) => {
    try {
      await deleteMedicine(medicine.id);
      message.success(`${medicine.name} deleted.`);
      await loadMedicines();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : 'Failed to delete the medicine.',
      );
    }
  };

  const handleRecordSale = async (quantitySold: number) => {
    if (!sellingMedicine) return;

    setSaving(true);
    try {
      await recordSale(sellingMedicine.id, quantitySold);
      message.success(`Recorded ${quantitySold} × ${sellingMedicine.name}.`);
      setSaleOpen(false);
      setSellingMedicine(null);
      await loadMedicines();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : 'Failed to record the sale.',
      );
    } finally {
      setSaving(false);
    }
  };

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

  const columns: ColumnsType<Medicine> = [
    {
      title: 'Medicine',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          {record.genericName && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.genericName}
            </Typography.Text>
          )}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [...new Set(medicines.map((m) => m.category))]
        .sort()
        .map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,
      render: (category: string) => <Tag color="cyan">{category}</Tag>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity: number) =>
        quantity < LOW_STOCK_THRESHOLD ? (
          <Tag color="red">{formatNumber(quantity)}</Tag>
        ) : (
          formatNumber(quantity)
        ),
    },
    {
      title: 'Unit price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Stock value',
      key: 'stockValue',
      align: 'right',
      sorter: (a, b) => a.quantity * a.unitPrice - b.quantity * b.unitPrice,
      render: (_, record) => formatCurrency(record.quantity * record.unitPrice),
    },
    {
      title: 'Sales',
      dataIndex: 'totalSold',
      key: 'totalSold',
      align: 'right',
      sorter: (a, b) => a.totalSold - b.totalSold,
      render: (totalSold: number, record) => (
        <div>
          <div style={{ fontWeight: 600, color: teal[700] }}>
            {formatNumber(totalSold)} sold
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formatCurrency(record.totalRevenue)}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      sorter: (a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''),
      render: (expiryDate: string | null) => {
        if (!expiryDate)
          return <Typography.Text type="secondary">—</Typography.Text>;

        const date = dayjs(expiryDate);
        const daysLeft = date.diff(dayjs(), 'day');

        if (daysLeft < 0) return <Tag color="red">Expired</Tag>;
        if (daysLeft <= EXPIRY_WARNING_DAYS) {
          return <Tag color="orange">{date.format('YYYY-MM-DD')}</Tag>;
        }
        return date.format('YYYY-MM-DD');
      },
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier: string | null) =>
        supplier ?? <Typography.Text type="secondary">—</Typography.Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              setSellingMedicine(record);
              setSaleOpen(true);
            }}
          >
            Sell
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this medicine?"
            description="Its sales history will be removed too."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Medicines
      </Typography.Title>

      <Card>
        <Space
          style={{
            marginBottom: 16,
            width: '100%',
            justifyContent: 'space-between',
          }}
          wrap
        >
          <Input.Search
            placeholder="Search name, generic, category or supplier"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 340 }}
          />

          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void loadMedicines()}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={() => void handleDownload()}
            >
              Download report
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add medicine
            </Button>
          </Space>
        </Space>

        <Table<Medicine>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t) => `${t} medicines`,
          }}
        />
      </Card>

      <MedicineFormModal
        open={formOpen}
        medicine={editing}
        saving={saving}
        onSubmit={handleSave}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <RecordSaleModal
        open={saleOpen}
        medicine={sellingMedicine}
        saving={saving}
        onSubmit={handleRecordSale}
        onCancel={() => {
          setSaleOpen(false);
          setSellingMedicine(null);
        }}
      />
    </>
  );
}
