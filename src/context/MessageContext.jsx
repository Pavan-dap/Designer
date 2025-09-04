import React, { createContext, useContext } from 'react';
import { message } from 'antd';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={messageApi}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => {
    const messageApi = useContext(MessageContext);
    if (!messageApi) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return messageApi;
};

export default MessageContext;