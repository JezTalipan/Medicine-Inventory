import { Alert, Descriptions, Form, InputNumber, Modal } from 'antd';
import { useEffect } from 'react';
import type { Medicine } from '../types';
import { formatCurrency } from '../utils/format';

interface SaleFormValues {
  quantitySold: number;
}

interface Props {
  open: boolean;
  medicine: Medicine | null;
  saving: boolean;
  onSubmit: (quantitySold: number) => void;
  onCancel: () => void;
}

export default function RecordSaleModal({
  open,
  medicine,
  saving,
  onSubmit,
  onCancel,
}: Props) {
  const [form] = Form.useForm<SaleFormValues>();
  const quantitySold = Form.useWatch('quantitySold', form) ?? 0;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ quantitySold: 1 });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values.quantitySold);
  };

  const outOfStock = medicine !== null && medicine.quantity === 0;

  return (
    <Modal
      open={open}
      title={medicine ? `Record sale — ${medicine.name}` : 'Record sale'}
      okText="Record sale"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={saving}
      okButtonProps={{ disabled: outOfStock }}
      destroyOnHidden
    >
      {medicine && (
        <>
          {outOfStock && (
            <Alert
              type="warning"
              showIcon
              title="This medicine is out of stock."
              style={{ marginBottom: 16 }}
            />
          )}

          <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="In stock">
              {medicine.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Unit price">
              {formatCurrency(medicine.unitPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Sale total">
              {formatCurrency(quantitySold * medicine.unitPrice)}
            </Descriptions.Item>
          </Descriptions>

          <Form<SaleFormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="quantitySold"
              label="Quantity sold"
              rules={[
                { required: true, message: 'Please enter the quantity sold.' },
                {
                  type: 'number',
                  min: 1,
                  max: medicine.quantity,
                  message: `Enter a quantity between 1 and ${medicine.quantity}.`,
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={1}
                max={Math.max(medicine.quantity, 1)}
                precision={0}
                autoFocus
                disabled={outOfStock}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}
