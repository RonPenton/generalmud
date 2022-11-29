# Events

GeneralMUD will have a scriptable eventing system wherein every object can have a one or more scripts applied to it. These scripts can have multiple events defined. 

There are two types of events: 
- cancelable
- actionable

# Cancelable Events

A cancelable event takes the form of "can<Event>", and asks the script if the action is allowed to be performed. These events should (in general) not make any changes to any data, they are simply asking if permission is granted to perform the action. 

For example, a "canEnter" event for an Exit can check to see if an actor has a given object before entering, and deny access to the portal if not. 

# Actionable Events

An actionable event takes the form of "has<Event>", and is performed once the "can<Event>" checks have passed. These events allow you to perform an action once the action has already been performed. These events cannot cancel the action, the action should have been cancelled on the "can<Event>" equivalent. 

For example, a "hasEntered" event for a room can set off an elaborate trap with timers and spikes, showing a warning to the user that they have accidentally activated something terrible.

# Rooms

- canLeave
- canEnter
- hasLeft
- hasEntered
- canLook
- hasLooked 

## Portals

- canEnter - asks whether an actor can enter a portal. Idempotent method, should not change anything. Can be used by pathfinding algorithms.
- tryEnter - asks whether an actor can enter a portal, with the assumption that the actor is actually attempting to do so. This method should take actions related to the attempt and return a boolean indicating whether it's allowed or not. 
- preEnter - informs the script that the event is going to happen, it has passed all checks. This allows the event to prepare for the actor to enter, and also alter the input parameters. For example, you can change the destination room in this script. The movement engine will use the new destination from that point on. 
- hasEntered - tells the portal that the user has entered the portal. This is not cancelable, it has happened and you cannot undo it. 
- canSee - determines if the user can see this portal
- canSeeThrough - determines if the user can see *through* this portal.
- command - attempts to parse the users input command to see if the portal recognizes the command. Return true to indicate that the command was accepted.
- describe - determines the value to show the user when they are shown this portal; a default value is supplied (the direction long-name)

## Movement Actions

When an actor attempts to move from one room to another, the following events are executed in order:

1. Starting Room - tryLeave
2. Portal - tryEnter
3. Destination Room - tryEnter
4. Starting Room - preLeave*
5. Portal - preEnter*
6. Destination Room - preEnter
7. <actor room is reassigned here>
8. Starting Room - hasLeft$
9. Portal - hasEntered$
10. Destination Room - hasEntered$

* - Since the preLeave/preEnter checks allow scripts to reassign a Destination Room or Portal, we could check the tryEnter scripts for the new destination. However, that would increase the complexity of the system and potentially allow an infinite loop to be formed with bad scripts. Because of this, we have decided that we will not re-check the tryEnter scripts for new portals/destination rooms, and it is up to the designer to design a system where a script will only ever re-route a person to a room that it already knows the user should be able to enter. 

$ - Similarly, while a hasLeft/hasEntered script may find some way to forcibly re-assign the user to a new room other than the Destination Room, this is considered bad practice. The Destination Room hasEntered event will still be called even if the user has been teleported to a different room during hasEntered. Use the preLeave/Enter events to "teleport" actors to a different location instead. 
