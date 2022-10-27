import React from 'react';
import { createClientCommand, isMe } from './base';
import { ChildrenProps } from '../foundation/top-bar';

createClientCommand('connected', (packet, context) => {
    if (isMe(packet.message.player))
        context.addOutput(<Connected>Connected!</Connected>);
    else    //TODO: eventually show a hyperlink to user so that you can interact in the GUI. Trade/Talk/Etc.
        context.addOutput(<Connected>{`${packet.message.player.name} has entered the game!`}</Connected>);
});

export const Connected: React.FC<ChildrenProps> = (props) => {
    return <div className="message connected">{props.children}</div>
}
