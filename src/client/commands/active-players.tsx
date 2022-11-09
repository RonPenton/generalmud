import { OneTimeRender } from '../components/OneTimeRender';
import React from 'react';
import { createClientCommand } from './base';
import { MessagePacket } from '../../server/messages';

createClientCommand('active-players', (packet, context) => {
    context.addOutput(<ActiveUsers {...packet} />);
});

export class ActiveUsers extends OneTimeRender<MessagePacket<'active-players'>> {
    render() {
        return (
            <div className="active-users">
                <hr className="divider" />
                <div>List of adventurers:</div>
                <ul>
                    {this.props.message.list.map(x => <li>{x.name}</li>)}
                </ul>
                <hr className="divider" />
            </div>
        );
    }
}