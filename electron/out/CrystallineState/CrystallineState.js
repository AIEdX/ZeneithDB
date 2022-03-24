import { StateMachine } from "./StateMachine.js";
export const CrystallineState = {
    createStateMachine(stateMachineData) {
        const stateMachine = new StateMachine(stateMachineData);
        return stateMachine;
    },
};
