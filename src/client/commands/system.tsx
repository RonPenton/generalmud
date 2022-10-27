import React from 'react';
import { ChildrenProps } from '../foundation/top-bar';
import { createClientCommand } from './base';

createClientCommand('system', (packet, context) => {
    context.addOutput(<System>{packet.message.text}</System>)
});

export const System: React.FC<ChildrenProps> = (props) => {
    return <div className="message system">{props.children}</div>
}
