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

## Exits

- canEnter
- hasEntered