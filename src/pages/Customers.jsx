import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Avatar, message, Spin, Modal, Form, Input, Select, DatePicker, Radio, Grid, Tooltip } from 'antd'
import { UserAddOutlined, MinusCircleOutlined, PlusOutlined, CheckCircleTwoTone } from '@ant-design/icons'
import { CustomersAPI } from '../api/endpoints'
import dayjs from 'dayjs'

const { Title } = Typography
const { useBreakpoint } = Grid;

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addForm] = Form.useForm()
  const [primaryIndex, setPrimaryIndex] = useState(0);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const load = async () => {
    try {
      setLoading(true)
      const data = await CustomersAPI.list()
      const transformed = data.map(c => ({
        ...c,
        Age: c.DOB ? dayjs().diff(dayjs(c.DOB), 'year') : null,
      }))
      setCustomers(transformed)
    } catch (e) {
      message.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createCustomer = async (values) => {
    try {
      const payload = {
        ...values,
        DOB: values.DOB ? values.DOB.format("YYYY-MM-DD") : null,
        Phone_No: values.Phone_No.map((p, idx) => ({
          Phone_No: p.Phone_No,
          IsPrimary: idx === values.Phone_No.findIndex((_, i) => i === values.primaryIndex)
        }))
      };
      await CustomersAPI.create(payload)
      message.success('Customer added')
      setAddOpen(false)
      addForm.resetFields()
      load()
    } catch (e) {
      // console.log('ewefe', e.response.data)
      message.error(e.response.data.error || 'Failed to add customer')
    }
  }

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'Name',
      render: (name, r) => (
        <Space>
          <Avatar>{name?.[0]}</Avatar>
          <span>{name}</span>
        </Space>
      ),
    },
    { title: 'Age', dataIndex: 'Age', render: (v) => v ? `${v} yr` : '-' },
    { title: 'DOB', dataIndex: 'DOB', },
    {
      title: "Phone Numbers",
      dataIndex: "Phone_No",
      render: (phones) => {
        if (!phones || phones.length === 0) return "-";

        const primary = phones.find((p) => p.IsPrimary);
        const others = phones.filter((p) => !p.IsPrimary);

        return (
          <Space>
            <span>
              {primary?.Phone_No}{" "}
              {primary && (
                <CheckCircleTwoTone twoToneColor="#52c41a" style={{ marginLeft: 4 }} />
              )}
            </span>

            {others.length > 0 && (
              <Tooltip
                title={others.map((o, idx) => (
                  <div key={idx}>{o.Phone_No}</div>
                ))}
              >
                <Tag color="blue">+{others.length}</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    { title: 'Address', dataIndex: 'Address' },
    {
      title: 'Gender',
      dataIndex: 'Gender',
      render: (v) => v ? <Tag color={v === 'Male' ? 'blue' : v === 'Female' ? 'pink' : 'purple'}>{v}</Tag> : <Tag>NA</Tag>
    },
    {
      title: 'Joined On',
      dataIndex: 'Create_At',
      render: (v) => v ? dayjs(v).format('DD MMM, YYYY') : '-'
    }
  ]

  return (
    <Card
      title={
        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          Customers
        </Title>
      }
      extra={
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setAddOpen(true)}>
          {isMobile ? null : 'Add Customer'}
        </Button>
      }
    >

      {loading ? (
        <div className="py-4 text-center"><Spin /></div>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={customers}
          size='small'
          bordered
          scroll={{ x: 'max-content' }}
        />
      )}

      <Modal
        title="Add Customer"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        centered
      >
        <Card variant='outlined'>
          <Form layout="vertical" form={addForm} onFinish={createCustomer}>
            <Form.Item name="Name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="DOB" label="Date of Birth" rules={[{ required: true }]}>
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>

            {/* Multiple Phones */}
            <Form.List
              name="Phone_No"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value || value.length < 1) {
                      return Promise.reject(new Error("At least one phone number is required"));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => {

                return (
                  <>
                    <Radio.Group
                      value={primaryIndex}
                      onChange={(e) => setPrimaryIndex(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      {fields.map(({ key, name, ...restField }, idx) => (
                        <Space
                          key={key}
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          {/* Primary Radio */}
                          <Radio value={idx} />

                          {/* Phone number input */}
                          <Form.Item
                            {...restField}
                            name={[name, "Phone_No"]}
                            rules={[{ required: true, message: "Phone number required" }]}
                          >
                            <Input placeholder="Phone No" />
                          </Form.Item>

                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                    </Radio.Group>

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Phone
                      </Button>
                    </Form.Item>
                  </>
                );
              }}
            </Form.List>

            <Form.Item name="Address" label="Address" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="Gender" label="Gender" rules={[{ required: true }]}>
              <Select placeholder="Select Gender">
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Modal>
    </Card>
  )
}
