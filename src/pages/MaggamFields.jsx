import React from "react";
import { Row, Col, Form, Input, InputNumber, Radio, Checkbox, Select, Divider } from "antd";

export const maggamFieldKeys = [
    "Pattern",
    "Top_Or_Blouse_Length",
    "Shoulder",
    "Chest",
    "Waist",
    "Armhole",
    "Sleeve_Length",
    "Sleeve_Loose",
    "Bottom_Length",
    "Bottom_Waist",
    "Other_If_Any",
    "Cut",
    "Design_Type",
    "Extra",
    "Material_Usage",
    "Neck",
];

const MaggamFields = ({ field }) => (
    <Row gutter={16}>
        {/* Basic numeric/text fields */}
        {[
            ["Pattern", "Pattern", Input],
            ["Top_Or_Blouse_Length", "Top/Blouse Length", InputNumber],
            ["Shoulder", "Shoulder", InputNumber],
            ["Chest", "Chest", InputNumber],
            ["Waist", "Waist", InputNumber],
            ["Armhole", "Armhole", InputNumber],
            ["Sleeve_Length", "Sleeve Length", InputNumber],
            ["Sleeve_Loose", "Sleeve Loose", InputNumber],
            ["Bottom_Length", "Bottom Length", InputNumber],
            ["Bottom_Waist", "Bottom Waist", InputNumber],
        ].map(([key, label, Comp]) => (
            <Col span={8} key={key}>
                <Form.Item name={[field.name, key]} label={label}>
                    <Comp style={{ width: 160 }} />
                </Form.Item>
            </Col>
        ))}

        {/* Other if any */}
        <Col span={24}>
            <Form.Item
                name={[field.name, "Other_If_Any"]}
                label="Other If Any"
            >
                <Input.TextArea rows={3} placeholder="Add key-value extras (JSON or text)" />
            </Form.Item>
        </Col>

        {/* Cut options */}
        <Col span={12}>
            <Form.Item name={[field.name, "Cut"]} label="Cut">
                <Radio.Group>
                    <Radio value="Princess Cut">Princess Cut</Radio>
                    <Radio value="Normal">Normal</Radio>
                </Radio.Group>
            </Form.Item>
        </Col>

        {/* Design type */}
        <Col span={12}>
            <Form.Item name={[field.name, "Design_Type"]} label="Design Type">
                <Input placeholder="Enter design type" />
            </Form.Item>
        </Col>

        {/* Extra checkboxes */}
        <Col span={24}>
            <Form.Item name={[field.name, "Extra"]} label="Extra">
                <Checkbox.Group
                    options={[
                        { label: "NeckLine", value: "NeckLine" },
                        { label: "Allover Sleeves", value: "Allover_Sleeves" },
                        { label: "Allover Blouse", value: "Allover_Blouse" },
                        { label: "Allover Booties", value: "Allover_Booties" },
                    ]}
                />
            </Form.Item>
        </Col>

        {/* Material usage lists */}
        <Divider>Material Usage</Divider>
        <Col span={8}>
            <Form.Item name={[field.name, "Thread_Colours"]} label="Thread Colours" initialValue={[]}>
                <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    placeholder="Add colours (name or #hex)"
                    tokenSeparators={[",", " "]}
                />
            </Form.Item>
        </Col>

        <Col span={8}>
            <Form.Item name={[field.name, "Beads_Colours"]} label="Beads Colours" initialValue={[]}>
                <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    placeholder="Add bead colours (name or #hex)"
                    tokenSeparators={[",", " "]}
                />
            </Form.Item>
        </Col>

        <Col span={8}>
            <Form.Item name={[field.name, "Zari_Colours"]} label="Zari Colours" initialValue={[]}>
                <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    placeholder="Add Zari colours (name or #hex)"
                    tokenSeparators={[",", " "]}
                />
            </Form.Item>
        </Col>

        {/* Neck details */}
        <Divider>Neck Details</Divider>
        <Col span={12}>
            <Form.Item label="Front - Broad" name={[field.name, "Neck", "Front", "Broad"]}>
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Front - Normal" name={[field.name, "Neck", "Front", "Normal"]}>
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>
        </Col>
        <Col span={12}>
            <Form.Item label="Back - Deep" name={[field.name, "Neck", "Back", "Deep"]}>
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Back - Keyhole" name={[field.name, "Neck", "Back", "Keyhole"]}>
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>
        </Col>
    </Row>
);

export default React.memo(MaggamFields);
