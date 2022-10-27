import React from 'react';

export interface ChildrenProps {
    children?: React.ReactNode
}

export const TopBar: React.FC<ChildrenProps> = (props) => {
    return <div className="top-bar">{props.children}</div>;
}

export const TopBarLeft: React.FC<ChildrenProps> = (props) => {
    return <div className="top-bar-left">{props.children}</div>;
}

export const TopBarRight: React.FC<ChildrenProps> = (props) => {
    return <div className="top-bar-right">{props.children}</div>;
}

export const TopBarMenu: React.FC<ChildrenProps> = (props) => {
    return <ul className="menu">{props.children}</ul>;
}

export const TopBarMenuTitle: React.FC<ChildrenProps> = (props) => {
    return <li className="menu-text">{props.children}</li>;
}

export interface TopBarMenuItemProps {
    href: string;
    children?: React.ReactNode
}

export const TopBarMenuItem: React.FC<TopBarMenuItemProps> = (props) => {
    return <li><a href={props.href}>{props.children}</a></li>;
}