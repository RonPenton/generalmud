import { OneTimeRender } from '../components/OneTimeRender';
import React from 'react';
import { createClientCommand, isNotMe } from './base';
import { MessagePacket } from '../../server/messages';
import { ActorReference } from '../../server/models/actor';


createClientCommand('room-description',
    (message, context) => {
        context.addOutput(<Description {...message} />);
        context.addRoomInformation(message.message);
    });

const ActorLink = (actor: ActorReference) => {
    return <li className="actor">{actor.name}</li>;
}

export class Description extends OneTimeRender<MessagePacket<'room-description'>> {
    render() {
        return (
            <div className="room">
                <div>&nbsp;</div>
                <div className="name">{this.props.message.name}</div>
                {this.description()}
                {this.actors()}
                {this.exits()}
            </div>
        );
    }

    actors() {
        const visible = this.props.message.actors.filter(isNotMe);
        if (!visible.length)
            return null;
        return (
            <div className="actors">
                <span className="actors-text">Here: </span>
                <ul>
                    {visible.map(ActorLink)}
                </ul>
            </div>
        );
    }

    description() {
        if (this.props.message.description)
            return <div className="description">{this.props.message.description}</div>
        return null;
    }

    exits() {
        const directions = Object.keys(this.props.message.exits);
        return <div className="exits"><span className="exit-text">Exits: </span>{directions.join(", ")}</div>
    }
}
