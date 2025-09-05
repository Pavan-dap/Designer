import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Card, Typography, Steps, Radio, Modal, Form, Input, Select, DatePicker, Row, Col, Collapse, Divider, Tag, Tabs, Popconfirm } from "antd";
import { CustomersAPI, MeasurementsAPI } from "../api/endpoints";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

import MaleFields, { maleFieldKeys } from "./MaleFields";
import FemaleFields, { femaleFieldKeys } from "./FemaleFields";
import { maggamFieldKeys } from "./MaggamFields";

const { Title } = Typography;
const { Panel } = Collapse;

// Simple unique id generator (stable per session)
function genId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Stable, top-level component to avoid remount on each keystroke
function MemberDetailsForm({
  familyMembers,
  initialValues,
  onValuesChange,
  activePanels,
  onActivePanelsChange,
}) {
  const [form] = Form.useForm();

  function handleCopy(memberIndex, targetIdx, sourceIdx, gender) {
    if (sourceIdx === undefined || sourceIdx === null) return;
    if (sourceIdx === targetIdx) return;

    const dresses = form.getFieldValue([memberIndex, "dresses"]) || [];
    const from = dresses?.[sourceIdx] || {};

    // Select the right schema
    const keys = gender === "Male" ? maleFieldKeys : femaleFieldKeys;

    keys.forEach((k) => {
      if (from[k] !== undefined) {
        form.setFieldValue([memberIndex, "dresses", targetIdx, k], from[k]);
      }
    });

    message.success("Copied measurements");
  }

  const activeKey = Array.isArray(activePanels) ? activePanels[0] : activePanels;

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(_, allValues) => onValuesChange?.(allValues)}
      initialValues={initialValues}
    >
      <Card title="Member Measurements">
        <Tabs
          tabBarStyle={{ marginTop: -24, marginBottom: 16 }}
          activeKey={activeKey}
          onChange={(k) => onActivePanelsChange?.(k)}
          items={familyMembers.map((member, index) => ({
            key: member.uid || String(index),
            label: `${member.name} (${member.gender})`,
            children: (
              <Form.List name={[index, "dresses"]} initialValue={[{ uid: genId("dress") }]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((dressField, dIndex) => (
                      <Card
                        key={dressField.key}
                        size="small"
                        title={`Dress ${dIndex + 1}`}
                        style={{ marginBottom: 8 }}
                        extra={
                          <Space size={8}>
                            <Select
                              size="small"
                              placeholder="Copy from"
                              style={{ width: 140 }}
                              onChange={(src) => handleCopy(index, dressField.name, src, member.gender)}
                              options={fields
                                .filter((f) => f.name !== dressField.name)
                                .map((f) => ({ label: `Dress ${Number(f.name) + 1}`, value: f.name }))}
                            />
                            <Button
                              danger
                              size="small"
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(dressField.name)}
                            />
                          </Space>
                        }
                      >
                        {member.gender === "Male" ? (
                          <MaleFields field={dressField} />
                        ) : (
                          <FemaleFields field={dressField} />
                        )}
                      </Card>
                    ))}
                    <Divider />
                    <Button
                      type="dashed"
                      onClick={() => add({ uid: genId("dress") })}
                      block
                    >
                      <PlusOutlined /> Add Dress
                    </Button>
                  </>
                )}
              </Form.List>
            ),
          }))}
        />
      </Card>
    </Form>
  );
}

export default function Orders() {
  const [orders] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNewOrder, setIsNewOrder] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [addForm] = Form.useForm();
  const [primaryIndex, setPrimaryIndex] = useState(0);

  const [familyMembers, setFamilyMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});
  const [activeMemberPanels, setActiveMemberPanels] = useState([]);

  function resetOrder() {
    setIsNewOrder(false);
    setCurrentStep(0);
    setFamilyMembers([]);
    setMemberDetails({});
    setSelectedCustomer(null);
    setCustomers([]);
  }

  async function submitOrder() {
    try {
      const requests = [];
      familyMembers.forEach((member, index) => {
        const dresses = (memberDetails?.[index]?.dresses || []).filter(Boolean);
        dresses.forEach((dress, dIndex) => {
          const payload = {
            Customer_Id: selectedCustomer,
            Member_Id: member.uid || index,
            Member_Name: member.name,
            Gender: member.gender,
            Dress_Index: dIndex + 1,
            ...dress,
          };
          if (member.gender === "Male") {
            requests.push(MeasurementsAPI.createBoy(payload));
          } else {
            requests.push(MeasurementsAPI.createGirl(payload));
          }
        });
      });

      if (requests.length === 0) {
        message.warning("No measurements to submit");
        return;
      }

      const results = await Promise.allSettled(requests);
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.length - successCount;

      if (successCount) message.success(`${successCount} measurement(s) submitted`);
      if (failCount) message.error(`${failCount} measurement(s) failed`);

      if (failCount === 0) {
        resetOrder();
      }
    } catch (e) {
      message.error(e?.response?.data?.error || "Failed to submit order");
    }
  }

  const loadCustomers = async () => {
    try {
      const result = await CustomersAPI.list();
      setCustomers(result);
    } catch (error) {
      message.error("Failed to load customers");
    }
  };

  const createCustomer = async (values) => {
    try {
      const payload = {
        ...values,
        DOB: values.DOB ? values.DOB.format("YYYY-MM-DD") : null,
        Phone_No: values.Phone_No.map((p, idx) => ({
          Phone_No: p.Phone_No,
          IsPrimary: idx === primaryIndex,
        })),
      };
      await CustomersAPI.create(payload);
      const result = await CustomersAPI.list();
      setCustomers(result);
      setIsModalVisible(false);
      addForm.resetFields();
      message.success("Customer created successfully");
      setCurrentStep((s) => s + 1);
    } catch (e) {
      message.error(e.response?.data?.error || "Failed to create customer");
    }
  };

  const CustomerSelectionStep = () => (
    <Card title="Select Customer">
      <Space style={{ width: "100%" }} direction="vertical">
        <Select
          style={{ width: "100%" }}
          showSearch
          placeholder="Select an existing customer"
          optionFilterProp="label"
          value={selectedCustomer}
          onChange={(value) => setSelectedCustomer(value)}
          options={customers.map((c) => ({
            value: c.Customer_Id,
            label: `${c.Name} - ${c.Customer_Id} (${c.Gender}) | ${c.Phone_No.find((p) => p.IsPrimary)?.Phone_No || ""} | ${c.Address}`,
            title: (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong>
                  {c.Name} - {c.Customer_Id}
                </strong>
                <span>
                  {c.Gender}, DOB: {c.DOB}
                </span>
                <span>📞 {c.Phone_No.map((p) => p.Phone_No).join(", ")}</span>
                <span>{c.Address}</span>
              </div>
            ),
          }))}
          optionRender={(option) => option.data.title}
          notFoundContent={customers.length === 0 ? "No customers found. Please add a new customer." : "No matching customers"}
        />

        {/* Centered, colorful button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            style={{
              maxWidth: 300,
              background: "linear-gradient(90deg, #1677ff 0%, #52c41a 100%)",
              border: "none",
              fontWeight: 600,
            }}
            onClick={() => setIsModalVisible(true)}
          >
            New Customer
          </Button>
        </div>
      </Space>
    </Card>
  );

  const FamilyMembersStep = () => {
    const [form] = Form.useForm();

    return (
      <Card title="Add Family Members">
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const next = (values.members || []).map((m) => ({ ...m, uid: m.uid || genId("mem") }));
            setFamilyMembers(next);
            message.success("Members saved");
          }}
          initialValues={{ members: familyMembers }}
        >
          <Form.List name="members">
            {(fields, { add, remove }) => (
              <>
                <Row gutter={[16, 16]}>
                  {fields.map((field, index) => (
                    <Col key={field.key} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        title={
                          <Space>
                            Member {index + 1}
                            <Button
                              danger
                              type="text"
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(field.name)}
                            />
                          </Space>
                        }
                      >
                        <Form.Item name={[field.name, "name"]} label="Name" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item name={[field.name, "gender"]} label="Gender" rules={[{ required: true }]}>
                          <Select
                            options={[
                              { label: "Male", value: "Male" },
                              { label: "Female", value: "Female" },
                            ]}
                          />
                        </Form.Item>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Form.Item style={{ marginTop: 16 }}>
                  <Button type="dashed" onClick={() => add()} block>
                    <PlusOutlined /> Add Family Member
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit">
            Save Members
          </Button>
        </Form>
      </Card>
    );
  };

  const ReviewStep = () => {
    const customer = customers.find((c) => c.Customer_Id === selectedCustomer);

    function renderFields(dress, keys) {
      return (
        <Row gutter={[8, 8]}>
          {keys.map((k) => {
            const val = dress?.[k];
            let display = "-";

            if (val !== undefined && val !== null && val !== "") {
              if (Array.isArray(val)) {
                display = val.join(", ");
              } else if (typeof val === "object") {
                // For nested objects like Neck or Extra, show readable string
                display = Object.entries(val)
                  .map(([key, v]) => {
                    if (typeof v === "object") {
                      return `${key}: ${Object.entries(v).map(([k2, v2]) => `${k2}: ${v2}`).join(", ")}`;
                    }
                    return `${key}: ${v}`;
                  })
                  .join(" | ");
              } else {
                display = val;
              }
            }

            return (
              <Col key={k} xs={24} sm={12}>
                <Space size={6} wrap>
                  <span style={{ color: "rgba(0,0,0,0.45)" }}>{k}:</span>
                  <Tag>{display}</Tag>
                </Space>
              </Col>
            );
          })}
        </Row>
      );
    }

    return (
      <Card
        title="Review Order"
        extra={<Tag color="blue">{customer ? customer.Name : "No customer selected"}</Tag>}
      >
        <Collapse accordion>
          {familyMembers.map((member, index) => {
            const dresses = (memberDetails?.[index]?.dresses || []).filter(Boolean);
            return (
              <Panel
                header={<Space><span>{member.name} ({member.gender})</span><Tag color="geekblue">{dresses.length} Dress(es)</Tag></Space>}
                key={member.uid || index}
              >
                <Row gutter={[16, 16]}>
                  {dresses.map((dress, dIndex) => (
                    <Col key={dress?.uid || dIndex} xs={24} md={12}>
                      <Card size="small" title={`Dress ${dIndex + 1}`}>
                        {member.gender === "Male" && renderFields(dress, maleFieldKeys)}
                        {member.gender === "Female" && (
                          <>
                            {renderFields(dress, femaleFieldKeys)}
                            {dress?.Maggam_Needed && renderFields(dress, maggamFieldKeys)}
                          </>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Panel>
            );
          })}
        </Collapse>
      </Card>
    );
  };

  const steps = [
    { title: "Customer", content: <CustomerSelectionStep /> },
    { title: "Members", content: <FamilyMembersStep /> },
    {
      title: "Details",
      content: (
        <MemberDetailsForm
          familyMembers={familyMembers}
          initialValues={memberDetails}
          onValuesChange={(vals) => setMemberDetails(vals)}
          activePanels={activeMemberPanels}
          onActivePanelsChange={(keys) => setActiveMemberPanels(keys)}
        />
      ),
    },
    { title: "Review", content: <ReviewStep /> },
  ];

  return (
    <>
      {!isNewOrder ? (
        <Card
          title={<Title level={3}>Orders</Title>}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsNewOrder(true); loadCustomers(); }}>
              New Order
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={[
              { title: "Order ID", dataIndex: "id" },
              { title: "Customer", dataIndex: "customer" },
              { title: "Date", dataIndex: "date" },
              { title: "Status", dataIndex: "status" },
            ]}
            dataSource={orders}
            bordered
            size="small"
            pagination={false}
          />
        </Card>
      ) : (
        <>
          <Steps current={currentStep} items={steps.map((s) => ({ title: s.title }))} />

          <div style={{ marginTop: 24 }}>{steps[currentStep].content}</div>

          <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "space-between" }}>

            {currentStep > 0 ? (
              <Button onClick={() => setCurrentStep((s) => s - 1)}>Previous</Button>
            ) : (
              <Popconfirm
                title="Cancel this order?"
                description="Your progress will be lost."
                okText="Yes, cancel"
                cancelText="No"
                onConfirm={resetOrder}
              >
                <Button danger>Cancel</Button>
              </Popconfirm>
            )}

            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => setCurrentStep((s) => s + 1)}>
                Next
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <Popconfirm
                title="Submit this order?"
                okText="Submit"
                cancelText="Review Again"
                onConfirm={submitOrder}
              >
                <Button type="primary">Submit Order</Button>
              </Popconfirm>
            )}
          </div>

          <Modal
            title="Create New Customer"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            centered
          >
            <Card variant="outlined">
              <Form layout="vertical" form={addForm} onFinish={createCustomer}>
                <Form.Item name="Name" label="Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="DOB" label="Date of Birth" rules={[{ required: true }]}>
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>

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
                  {(fields, { add, remove }) => (
                    <>
                      <Radio.Group value={primaryIndex} onChange={(e) => setPrimaryIndex(e.target.value)} style={{ width: "100%" }}>
                        {fields.map(({ key, name, ...restField }, idx) => (
                          <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                            <Radio value={idx} />
                            <Form.Item {...restField} name={[name, "Phone_No"]} rules={[{ required: true, message: "Phone number required" }]}>
                              <Input placeholder="Phone No" />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                      </Radio.Group>
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Add Phone
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>

                <Form.Item name="Address" label="Address">
                  <Input />
                </Form.Item>
                <Form.Item name="Gender" label="Gender" rules={[{ required: true }]}>
                  <Select placeholder="Select Gender">
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Female">Female</Select.Option>
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
        </>
      )}
    </>
  );
}
