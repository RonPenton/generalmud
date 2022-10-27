import React from 'react';
import { createClientCommand, isMe } from './base';
import { ChildrenProps } from '../foundation/top-bar';

createClientCommand('disconnected', (packet, context) => {
    const { player } = packet.message;
    if (isMe(player))
        return;
    else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
        context.addOutput(<Disconnected>{`${player.name} has disconnected!`}</Disconnected>)
});

export const Disconnected: React.FC<ChildrenProps> = (props) => {
    return <div className="message disconnected">{props.children}</div>
}
