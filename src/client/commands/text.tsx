import React from 'react';
import { RichText } from '../components/RichText';
import { createClientCommand } from './base';

createClientCommand('text', (packet, context) => {
    context.addOutput(<Text text={packet.message.text} />)
});

export const Text: React.FC<{ text: string }> = ({ text }) => {
    return <div className="message text"><RichText text={text} /></div>
}
