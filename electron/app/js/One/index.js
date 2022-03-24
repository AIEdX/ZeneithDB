import { CrystallineState } from "../../out/index.js";
const machine = CrystallineState.createStateMachine({
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
