import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Space, Tag, message, Card, Typography, Steps, Radio, Modal, Form, Input, Select, DatePicker, Row, Col, Collapse, Checkbox, InputNumber, Divider, } from "antd";
import { CustomersAPI } from "../api/endpoints";
import { PlusOutlined, MinusCircleOutlined, CopyOutlined, } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// Measurement fields for a Female member's dress
const femaleDressFields = ["Pattern", "Full_Length", "Blouse_Length", "Shoulder", "Chest", "Waist", "ARM_Hole", "SLeev_Length", "SLeev_Loose", "Cuts_From", "Bottom_Length", "Ankle", "Piping_Colour", "Other_If_Any",];

const cuttingOptions = ["Princess Cut", "Add Cups", "Back Open", "Front Open"];

// Measurement fields for a Male member's dress
const maleDressFields = ["Pattern", "Full_Length", "Shoulder", "Chest", "Waist", "SLeev_Length", "SLeev_Loose", "Bottom_Length", "Ankle", "Piping_Colour", "Other_If_Any",];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNewOrder, setIsNewOrder] = useState(false);

  // New states for customer creation
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [addForm] = Form.useForm();
  const [primaryIndex, setPrimaryIndex] = useState(0);

  const [familyMembers, setFamilyMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});
  const [activeMemberPanels, setActiveMemberPanels] = useState([]);

  // Load existing customers
  const loadCustomers = async () => {
    try {
      const result = await CustomersAPI.list();
      setCustomers(result);
    } catch (error) {
      message.error("Failed to load customers");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /** ---------------- Customer Creation Logic ------------------ **/

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
      const newCustomer = await CustomersAPI.create(payload);
      setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
      setSelectedCustomer(newCustomer.id);
      setIsModalVisible(false);
      addForm.resetFields();
      message.success("Customer created successfully");
      // Move to the next step immediately
      setCurrentStep(currentStep + 1);
    } catch (e) {
      message.error(e.response?.data?.error || "Failed to create customer");
    }
  };

  /** ---------------- Steps ------------------ **/

  // Step 1: Select Customer
  const CustomerSelectionStep = () => (
    <Card title="Select Customer">
      <Space>
        <Select
          style={{ width: 300 }}
          showSearch
          placeholder="Select an existing customer"
          options={customers.map((c) => ({
            label: c.Name,
            value: c.id,
          }))}
          onChange={(value) => setSelectedCustomer(value)}
          value={selectedCustomer}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          New Customer
        </Button>
      </Space>
    </Card>
  );

  // Step 2: Add Members
  const FamilyMembersStep = () => {
    const [form] = Form.useForm();

    return (
      <Card title="Add Family Members">
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => setFamilyMembers(values.members || [])}
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
                        <Form.Item
                          {...field}
                          name={[field.name, "name"]}
                          label="Name"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, "gender"]}
                          label="Gender"
                          rules={[{ required: true }]}
                        >
                          <Select
                            options={[
                              { label: "Male", value: "Male" },
                              { label: "Female", value: "Female" },
                              { label: "Other", value: "Other" },
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

  // Step 3: Member Measurement Details
  const MemberDetailsStep = () => {
    const [form] = Form.useForm(); // <-- form instance

    // Update memberDetails whenever form changes
    const onValuesChange = (_, allValues) => {
      setMemberDetails(allValues);
    };

    return (
      <Form
        form={form}
        layout="vertical"
        onValuesChange={onValuesChange}
        initialValues={memberDetails}
      >
        <Card title="Member Measurements">
          <Collapse
            accordion
            activeKey={activeMemberPanels}
            onChange={(keys) => setActiveMemberPanels(keys)}
          >
            {familyMembers.map((member, index) => (
              <Panel header={`${member.name} (${member.gender})`} key={index}>
                <Form.List name={[index, "dresses"]} initialValue={[{}]}>
                  {(fields, { add: addDress, remove: removeDress }) => (
                    <>
                      {fields.map((dressField, dressIndex) => (
                        <Card
                          key={dressIndex}
                          size="small"
                          title={`Dress ${dressIndex + 1}`}
                          extra={
                            <Space>
                              <Button
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => removeDress(dressField.name)}
                              />
                            </Space>
                          }
                        >
                          {member.gender === "Female" ? (
                            <FemaleDressForm field={dressField} />
                          ) : member.gender === "Male" ? (
                            <MaleDressForm field={dressField} />
                          ) : (
                            <p>No measurement fields for this gender.</p>
                          )}
                        </Card>
                      ))}
                      <Divider />
                      <Button type="dashed" onClick={() => addDress()} block>
                        <PlusOutlined /> Add Dress
                      </Button>
                    </>
                  )}
                </Form.List>
              </Panel>
            ))}
          </Collapse>
        </Card>
      </Form>
    );
  };

  const FemaleDressForm = React.memo(({ field }) => (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Pattern"]} label="Pattern"><Input /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Full_Length"]} label="Full Length"><Input /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Blouse_Length"]} label="Blouse Length"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Shoulder"]} label="Shoulder"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Chest"]} label="Chest"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Waist"]} label="Waist"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "ARM_Hole"]} label="Arm Hole"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "SLeev_Length"]} label="Sleeve Length"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "SLeev_Loose"]} label="Sleeve Loose"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Cuts_From"]} label="Cuts From"><Input /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Bottom_Length"]} label="Bottom Length"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item valuePropName="checked" label="Ankle" name="Ankle"><Checkbox>Ankle</Checkbox></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Piping_Colour"]} label="Piping Colour"><Input /></Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item {...field} name={[field.name, "Cutting"]} label="Cutting"><Checkbox.Group options={cuttingOptions} /></Form.Item>
      </Col>
      <Col span={24}>
        <Divider orientation="left">Neck</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Front Neck" name={["Neck", "Front"]}>
              <Input.Group compact>
                <Form.Item name={["Neck", "Front", "Normal"]} noStyle><InputNumber placeholder="Normal" /></Form.Item>
                <Form.Item name={["Neck", "Front", "Broad"]} noStyle><InputNumber placeholder="Broad" /></Form.Item>
                <Form.Item name={["Neck", "Front", "Boat"]} valuePropName="checked" noStyle><Checkbox>Boat</Checkbox></Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Back Neck" name={["Neck", "Back"]}>
              <Input.Group compact>
                <Form.Item name={["Neck", "Back", "Deep"]} noStyle><InputNumber placeholder="Deep" /></Form.Item>
                <Form.Item name={["Neck", "Back", "Keyhole"]} valuePropName="checked" noStyle><Checkbox>Keyhole</Checkbox></Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Form.Item {...field} name={[field.name, "Other_If_Any"]} label="Other If Any"><Input.TextArea /></Form.Item>
      </Col>
    </Row>
  ));

  // Create a separate component for the Male dress form fields
  const MaleDressForm = React.memo(({ field }) => (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Pattern"]} label="Pattern"><Input /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Full_Length"]} label="Full Length"><Input /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Shoulder"]} label="Shoulder"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Chest"]} label="Chest"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Waist"]} label="Waist"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "SLeev_Length"]} label="Sleeve Length"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "SLeev_Loose"]} label="Sleeve Loose"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Bottom_Length"]} label="Bottom Length"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Ankle"]} label="Ankle" valuePropName="checked"><Checkbox>Ankle</Checkbox></Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {...field} name={[field.name, "Piping_Colour"]} label="Piping Colour"><Input /></Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item {...field} name={[field.name, "Other_If_Any"]} label="Other If Any"><Input.TextArea /></Form.Item>
      </Col>
    </Row>
  ));

  // Step 4: Review & Confirm
  const ReviewStep = () => {
    const customer = customers.find((c) => c.id === selectedCustomer);
    return (
      <Card title="Review Order">
        <h3>Customer</h3>
        <p>{customer ? `${customer.Name}` : "No customer selected"}</p>

        <h3>Family Members</h3>
        {familyMembers.map((member, index) => (
          <Card
            key={index}
            style={{ marginBottom: 16 }}
            title={`${member.name} (${member.gender})`}
          >
            {(memberDetails[index]?.dresses || []).map((dress, dIndex) => (
              <Card
                key={dIndex}
                type="inner"
                title={`Dress ${dIndex + 1}`}
                style={{ marginBottom: 8 }}
              >
                <p>
                  **Measurements:**
                  <br />
                  {Object.entries(dress).map(([key, value]) => {
                    if (typeof value === "object" && value !== null) {
                      return (
                        <span key={key}>
                          **{key}:**
                          <br />
                          {Object.entries(value).map(([neckKey, neckValue]) => (
                            <span key={neckKey}>
                              &nbsp;&nbsp;{neckKey}:{" "}
                              {typeof neckValue === "boolean"
                                ? neckValue
                                  ? "Yes"
                                  : "No"
                                : neckValue || "N/A"}
                              <br />
                            </span>
                          ))}
                        </span>
                      );
                    }
                    if (Array.isArray(value)) {
                      return (
                        <span key={key}>
                          **{key}:** {value.join(", ")}
                          <br />
                        </span>
                      );
                    }
                    if (typeof value === "boolean") {
                      return (
                        <span key={key}>
                          **{key}:** {value ? "Yes" : "No"}
                          <br />
                        </span>
                      );
                    }
                    return (
                      <span key={key}>
                        **{key}:** {value || "N/A"}
                        <br />
                      </span>
                    );
                  })}
                </p>
              </Card>
            ))}
          </Card>
        ))}
      </Card>
    );
  };

  const steps = [
    { title: "Customer", content: <CustomerSelectionStep /> },
    { title: "Members", content: <FamilyMembersStep /> },
    { title: "Details", content: <MemberDetailsStep /> },
    { title: "Review", content: <ReviewStep /> },
  ];

  /** ---------------- UI ------------------ **/
  return (
    <>
      {!isNewOrder ? (
        <Card
          title={<Title level={3}>Orders</Title>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsNewOrder(true)}
            >
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
            dataSource={[]}
            bordered
            size="small"
            pagination={false}
          />
        </Card>
      ) : (
        <>
          <Steps
            current={currentStep}
            items={steps.map((s) => ({ title: s.title }))}
          />

          <div style={{ marginTop: 24 }}>{steps[currentStep].content}</div>

          <div style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  message.success("Order submitted successfully!");
                  setIsNewOrder(false);
                  setCurrentStep(0);
                  setFamilyMembers([]);
                  setMemberDetails({});
                  setSelectedCustomer(null);
                }}
              >
                Submit Order
              </Button>
            )}
          </div>

          {/* Create New Customer Modal */}
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
                <Form.Item
                  name="DOB"
                  label="Date of Birth"
                  rules={[{ required: true }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>

                {/* Multiple Phones */}
                <Form.List
                  name="Phone_No"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (!value || value.length < 1) {
                          return Promise.reject(
                            new Error("At least one phone number is required")
                          );
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
                                rules={[
                                  {
                                    required: true,
                                    message: "Phone number required",
                                  },
                                ]}
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

                <Form.Item name="Address" label="Address">
                  <Input />
                </Form.Item>
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
        </>
      )}
    </>
  );
}