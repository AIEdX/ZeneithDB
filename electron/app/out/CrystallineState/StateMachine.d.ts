import { StateMachineData } from "./Meta/StateMachine.data.types";
export declare class StateMachine<STATES> {
    stateMachineData: StateMachineData<STATES>;
    history: {
        previousState: string;
        newState: string;
        event: string;
    }[];
    activeState: keyof STATES;
    states: Record<keyof STATES, Record<string, {
        nextState: string;
        procedures: {
            bind?: any;
            func: Function;
        }[];
    }>>;
    constructor(stateMachineData: StateMachineData<STATES>);
    isStateActive(state: keyof STATES): boolean;
    registerState<STATE extends keyof STATES, EVENT extends keyof STATES[STATE]>(state: STATE, event: Record<EVENT, keyof STATES>): void;
    triggerEventOnState<STATE extends keyof STATES, EVENT extends keyof STATES[STATE], ARGS extends STATES[STATE][EVENT]>(state: STATE, event: EVENT, args: ARGS): void;
    addToStateEvent<STATE extends keyof STATES, EVENT extends keyof STATES[STATE], ARGS extends STATES[STATE][EVENT]>(state: STATE, event: EVENT, func: (args: ARGS) => void, bind?: any): void;
}
