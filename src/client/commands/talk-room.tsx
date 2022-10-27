import React from 'react';
import { createClientCommand, isMe } from './base';
import { MessagePacket } from '../../server/messages';

createClientCommand('talk-room', (message, context) => {
    context.addOutput(<TalkRoom {...message} />);
});

export const TalkRoom: React.FC<MessagePacket<'talk-room'>> = props => {

    const { message: { from, message } } = props;
    const { name } = from;

    const text = isMe(from)
        ? `You say: \"${message}\"`
        : `${name} says: \"${message}\"`;
    return (
        <div className="talk-room">
            {text}
        </div>
    );
}
