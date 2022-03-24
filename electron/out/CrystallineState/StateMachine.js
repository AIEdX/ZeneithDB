export class StateMachine {
    stateMachineData;
    history = [];
    activeState;
    states;
    constructor(stateMachineData) {
        this.stateMachineData = stateMachineData;
        this.states = {};
    }
    isStateActive(state) {
        return this.activeState == state;
    }
    registerState(state, event) {
        this.states[state] = {};
        for (const eventKey of Object.keys(event)) {
            this.states[state][eventKey] = {
                nextState: event[eventKey],
                procedures: [],
            };
        }
    }
    triggerEventOnState(state, event, args) {
        if (!this.states[state]) {
            throw new Error(`The state ${state} does not exist: machine- ${this.stateMachineData.name}.`);
        }
        if (!this.states[state][event]) {
            throw new Error(`The event ${event} does not exist on the state ${state}.: machine-> ${this.stateMachineData.name} data.`);
        }
        const procedures = this.states[state][event].procedures;
        for (const procedure of procedures) {
            if (procedure.bind && typeof procedure.bind == "object") {
                procedure.func.call(procedure.bind, args);
            }
            else {
                procedure.func(args);
            }
        }
        if (this.stateMachineData.historyLength > 0) {
            if (this.history.length > this.stateMachineData.historyLength) {
                this.history.shift();
            }
            this.history.push({
                previousState: this.activeState,
                newState: state,
                event: event,
            });
        }
        this.activeState = state;
    }
    addToStateEvent(state, event, func, bind) {
        if (!this.states[state]) {
            throw new Error(`The state ${state} does not exist: machine- ${this.stateMachineData.name}.`);
        }
        if (!this.states[state][event]) {
            throw new Error(`The event ${event} does not exist on the state ${state}.: machine-> ${this.stateMachineData.name} data.`);
        }
        this.states[state][event].procedures.push({
            bind: bind,
            func: func,
        });
    }
}
