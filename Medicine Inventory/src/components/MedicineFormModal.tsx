import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import type { Medicine, MedicineUpsert } from '../types';

const CATEGORY_OPTIONS = [
  'Analgesic',
  'Antibiotic',
  'Antihistamine',
  'Antacid',
  'Vitamin',
  'Cough & Cold',
  'Cardiovascular',
  'Other',
];

interface MedicineFormValues {
  name: string;
  genericName?: string;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate?: Dayjs | null;
  supplier?: string;
}

interface Props {
  open: boolean;
  /** The medicine being edited, or null when adding a new one. */
  medicine: Medicine | null;
  saving: boolean;
  onSubmit: (values: MedicineUpsert) => void;
  onCancel: () => void;
}

export default function MedicineFormModal({
  open,
  medicine,
  saving,
  onSubmit,
  onCancel,
}: Props) {
  const [form] = Form.useForm<MedicineFormValues>();
  const isEditing = medicine !== null;

  useEffect(() => {
    if (!open) return;

    if (medicine) {
      form.setFieldsValue({
        name: medicine.name,
        genericName: medicine.genericName ?? undefined,
        category: medicine.category,
        quantity: medicine.quantity,
        unitPrice: medicine.unitPrice,
        expiryDate: medicine.expiryDate ? dayjs(medicine.expiryDate) : null,
        supplier: medicine.supplier ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, medicine, form]);

  const handleOk = async () => {
    const values = await form.validateFields();

    onSubmit({
      name: values.name.trim(),
      genericName: values.genericName?.trim() || null,
      category: values.category,
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      expiryDate: values.expiryDate
        ? values.expiryDate.format('YYYY-MM-DD')
        : null,
      supplier: values.supplier?.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      title={isEditing ? `Edit ${medicine.name}` : 'Add medicine'}
      okText={isEditing ? 'Save changes' : 'Add medicine'}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={saving}
      destroyOnHidden
      mask={{ closable: false }}
    >
      <Form<MedicineFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ quantity: 0, unitPrice: 0, category: 'Analgesic' }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter the medicine name.' },
          ]}
        >
          <Input placeholder="e.g. Biogesic 500mg" maxLength={200} />
        </Form.Item>

        <Form.Item name="genericName" label="Generic name">
          <Input placeholder="e.g. Paracetamol" maxLength={200} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please choose a category.' }]}
        >
          <Select
            options={CATEGORY_OPTIONS.map((value) => ({ value, label: value }))}
            showSearch
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity in stock"
          rules={[{ required: true, message: 'Please enter the quantity.' }]}
        >
          <InputNumber min={0} precision={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="unitPrice"
          label="Unit price"
          rules={[{ required: true, message: 'Please enter the unit price.' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            step={0.25}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="expiryDate" label="Expiry date">
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="supplier" label="Supplier" style={{ marginBottom: 0 }}>
          <Input placeholder="e.g. Unilab" maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
