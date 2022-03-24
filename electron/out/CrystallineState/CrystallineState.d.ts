import type { StateMachineData } from "./Meta/StateMachine.data.types";
import { StateMachine } from "./StateMachine.js";
export declare const CrystallineState: {
    createStateMachine<STATES>(stateMachineData: StateMachineData<STATES>): StateMachine<STATES>;
};
