import { getDirectionOpposite, getEnteringPhrase, getLeavingPhrase } from '../../server/models/direction';
import { OneTimeRender } from '../components/OneTimeRender';
import React from 'react';
import * as Messages from '../../server/messages';
import { createClientCommand, isMe } from './base';

createClientCommand('actor-moved', (packet, context) => {
    context.addOutput(<Movement {...packet} />);
});

export class Movement extends OneTimeRender<Messages.MessagePacket<'actor-moved'>> {
    render() {

        const { from, direction, entered } = this.props.message;

        if (isMe(from))
            return null;

        const phrase = direction
            ? entered
                ? ` enters ${getEnteringPhrase(getDirectionOpposite(direction))}`
                : ` leaves ${getLeavingPhrase(direction)}`
            : entered
                ? ' appears out of nowhere'
                : ' disappears into thin air'

        return (
            <div className="actor-moved">
                <span className="name">{from.name}</span>
                {phrase}
            </div>
        );
    }
}
