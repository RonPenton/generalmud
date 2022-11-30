import React from 'react';
import { ChildrenProps } from '../foundation/top-bar';
import { createClientCommand } from './base';

createClientCommand('text', (packet, context) => {
    context.addOutput(<Text>{packet.message.text}</Text>)
});

export const Text: React.FC<ChildrenProps> = (props) => {
    return <div className="message text">{props.children}</div>
}
