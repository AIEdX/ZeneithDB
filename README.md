<h1 align="center">
   Crystalline State
</h1>

<p align="center">
<img src="https://i.ibb.co/Vg6knp0/crystalstatelogo.png" alt="crystalstatelogo" border="0">
</p>

---

This is a simple TypeScript library for a state machine that can be used to manage the state of an app.

You define it's states, the events for state, and the resulting state when it is triggered. 
You can also define the type of args to pass each function call when an event is triggered. 

Here is an example of how to use it:

```ts
import { CrystallineState } from "../../out/index.js";

type StateEventMap = {
 IDLE: {
  START: {
   data: any;
  };
 };
 IDLE2: {
  START2: {
   data: any;
  };
  START3: {
   data: any;
  };
 };
};

const machine = CrystallineState.createStateMachine<StateEventMap>({
 name: "test",
 historyLength: 0,
});

machine.registerState("IDLE", {
 START: "IDLE",
});
machine.registerState("IDLE2", {
 START2: "IDLE",
 START3: "IDLE",
});

machine.addToStateEvent("IDLE", "START", (args) => {
 console.log(args.data);
});

machine.triggerEventOnState("IDLE", "START", { data: "triggered the event." });
```

