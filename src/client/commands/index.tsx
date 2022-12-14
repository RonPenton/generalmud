import React from 'react';
import { ErrorComponent } from './error';
import { GameContext } from '../App';
import { ChildrenProps } from '../foundation/top-bar';
import { MessageName, MessagePacket } from '../../server/messages';
import { getClientCommand } from './base';

import './error';
import './connected';
import './disconnected';
import './system';
import './talk-global';
import './talk-room';
import './talk-private';
import './room-description';
import './actor-moved';
import './active-players';
import './text';

export function handle<T extends MessageName>(message: MessagePacket<T>, context: GameContext) {
    const command = getClientCommand(message.type);
    if (!command) {
        const error = `Message not supported: ${message.type}`;
        context.addOutput(<ErrorComponent>{error}</ErrorComponent>)
        return;
    }

    command.execute(message, context);
}

export const Generic: React.FC<ChildrenProps> = (props) => {
    return <div className="message generic">{props.children}</div>
}
