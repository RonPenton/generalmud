import React from 'react';
import { createClientCommand } from './base';
import { MessagePacket } from '../../server/messages';

createClientCommand('talk-private', (message, context) => {
    context.addOutput(<TalkPrivate {...message} />);
});

export const TalkPrivate: React.FC<MessagePacket<'talk-private'>> = props => {

    const { message: { from: { name }, message } } = props;

    return (
        <div className="talk-private">
            {`${name} whispers to you, "${message}"`}
        </div>
    );
}
