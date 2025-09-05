import React from "react";
import { Row, Col, Form, Input, InputNumber } from "antd";

export const maleFieldKeys = [
    "Pattern",
    "Top_Length",
    "Collar",
    "Shoulder",
    "Chest",
    "Waist",
    "Stomach",
    "Hip",
    "Arm_Hole",
    "Sleeve_Length",
    "Sleeve_Loose",
    "Bottom_Pattern",
    "Bottom_Length",
    "Bottom_Waist",
    "Ankle",
    "Knee",
    "Thigh",
    "Kifta",
    "Other_Specification",
];

const MaleFields = ({ field }) => (
    <Row gutter={[16, 16]}>
        {[
            ["Pattern", "Pattern", Input],
            ["Top_Length", "Top Length", InputNumber],
            ["Collar", "Collar", InputNumber],
            ["Shoulder", "Shoulder", InputNumber],
            ["Chest", "Chest", InputNumber],
            ["Waist", "Waist", InputNumber],
            ["Stomach", "Stomach", InputNumber],
            ["Hip", "Hip", InputNumber],
            ["Arm_Hole", "Arm Hole", InputNumber],
            ["Sleeve_Length", "Sleeve Length", InputNumber],
            ["Sleeve_Loose", "Sleeve Loose", InputNumber],
            ["Bottom_Pattern", "Bottom Pattern", Input],
            ["Bottom_Length", "Bottom Length", InputNumber],
            ["Bottom_Waist", "Bottom Waist", InputNumber],
            ["Ankle", "Ankle", InputNumber],
            ["Knee", "Knee", InputNumber],
            ["Thigh", "Thigh", InputNumber],
            ["Kifta", "Kifta", InputNumber],
        ].map(([key, label, Comp]) => (
            <Col xs={24} sm={12} md={8} key={key}>
                <Form.Item name={[field.name, key]} label={label}>
                    <Comp style={{ width: "100%" }} />
                </Form.Item>
            </Col>
        ))}

        <Col span={24}>
            <Form.Item
                name={[field.name, "Other_Specification"]}
                label="Other Specification"
            >
                <Input.TextArea rows={3} placeholder="Add extra measurements (JSON or text)" />
            </Form.Item>
        </Col>
    </Row>
);

export default React.memo(MaleFields);
