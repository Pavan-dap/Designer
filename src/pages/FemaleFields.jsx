import React from "react";
import { Row, Col, Form, Input, InputNumber, Radio, Space, Divider } from "antd";
import MaggamFields from "./MaggamFields";

export const femaleFieldKeys = [
    "Pattern",
    "Full_Length",
    "Blouse_Length",
    "Shoulder",
    "Chest",
    "Waist",
    "NP",
    "HIP",
    "Arm_Hole",
    "Sleeve_Length",
    "Sleeve_Loose",
    "Cuts_From",
    "Bottom_Length",
    "Ankle",
    "Others_If_Any",
    "Extra",
    "Neck",
    "Other_Details",
    "Piping_Color",
    "Maggam_Needed"
];

const FemaleFields = ({ field, memberIndex }) => {
    const maggamNeeded = Form.useWatch([memberIndex, "dresses", field.name, "Maggam_Needed"]);

    return (
        <Row gutter={[16, 16]}>
            {[
                ["Pattern", "Pattern", Input],
                ["Full_Length", "Full Length", InputNumber],
                ["Blouse_Length", "Blouse Length", InputNumber],
                ["Shoulder", "Shoulder", InputNumber],
                ["Chest", "Chest", InputNumber],
                ["Waist", "Waist", InputNumber],
                ["NP", "NP", InputNumber],
                ["HIP", "Hip", InputNumber],
                ["Arm_Hole", "Arm Hole", InputNumber],
                ["Sleeve_Length", "Sleeve Length", InputNumber],
                ["Sleeve_Loose", "Sleeve Loose", InputNumber],
                ["Cuts_From", "Cuts From", Input],
                ["Bottom_Length", "Bottom Length", InputNumber],
                ["Ankle", "Ankle", InputNumber],
                ["Piping_Color", "Piping Color", Input],
            ].map(([key, label, Comp]) => (
                <Col xs={24} sm={12} md={8} key={key}>
                    <Form.Item name={[field.name, key]} label={label}>
                        <Comp style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            ))}

            <Col span={24}>
                <Form.Item name={[field.name, "Others_If_Any"]} label="Others If Any">
                    <Input.TextArea rows={2} placeholder="JSON or notes" />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Extra">
                    <Space direction="vertical">
                        <Form.Item name={[field.name, "Extra", "Cut"]} label="Cut">
                            <Radio.Group>
                                <Radio value="PrincessCut">Princess Cut</Radio>
                                <Radio value="Normal">Normal</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name={[field.name, "Extra", "Open"]} label="Open">
                            <Radio.Group>
                                <Radio value="Back Open">Back Open</Radio>
                                <Radio value="Front Open">Front Open</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name={[field.name, "Extra", "Cups"]} label="Cups">
                            <Radio.Group>
                                <Radio value="Add Cups">Add Cups</Radio>
                                <Radio value="No Cups">No Cups</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name={[field.name, "Extra", "Can"]} label="Can">
                            <Radio.Group>
                                <Radio value="Add Can">Add Can</Radio>
                                <Radio value="No Can">No Can</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Space>
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Neck">
                    <Row gutter={[12, 12]}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Front - Broad" name={[field.name, "Neck", "Front", "Broad"]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Front - Normal" name={[field.name, "Neck", "Front", "Normal"]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Front - Deep" name={[field.name, "Neck", "Front", "Deep"]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Back - Deep" name={[field.name, "Neck", "Back", "Deep"]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Back - Keyhole" name={[field.name, "Neck", "Back", "Keyhole"]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item name={[field.name, "Other_Details"]} label="Other Details">
                    <Input.TextArea rows={3} placeholder="Add notes or JSON details" />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item name={[field.name, "Maggam_Needed"]} label="Maggam Needed">
                    <Radio.Group>
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                    </Radio.Group>
                </Form.Item>
            </Col>

            {maggamNeeded && (
                <Col span={24}>
                    <Divider orientation="left">Maggam Fields</Divider>
                    <MaggamFields field={field} />
                </Col>
            )}
        </Row>
    );
};

export default React.memo(FemaleFields);
