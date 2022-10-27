import React from 'react';
import { ChildrenProps } from '../foundation/top-bar';
import { createClientCommand } from './base';

createClientCommand('error', (message, context) => {
    context.addOutput(<ErrorComponent>{message.message.text}</ErrorComponent>)
});

export const ErrorComponent: React.FC<ChildrenProps> = (props) => {
    return <div className="message error">{props.children}</div>
}
