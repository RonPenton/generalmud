import React from 'react';
import { createClientCommand, isMe } from './base';
import { MessagePacket } from '../../server/messages';

createClientCommand('talk-global', (message, context) => {
    context.addOutput(<Global {...message} />);
});

export const Global: React.FC<MessagePacket<'talk-global'>> = props => {
    const name = isMe(props.message.from) ? "You chat: " : `${props.message.from.name} chats: `;
    return (
        <div className="talk-global">
            <>
                <span className="identifier">{name}</span>
                {props.message.message}
            </>
        </div>
    );
}

