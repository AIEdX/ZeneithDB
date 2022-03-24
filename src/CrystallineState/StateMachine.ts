import { StateMachineData } from "./Meta/StateMachine.data.types";

export class StateMachine<STATES> {
 history: {
  previousState: string;
  newState: string;
  event: string;
 }[] = [];
 activeState: keyof STATES;
 states: Record<
  keyof STATES,
  Record<
   string,
   {
    nextState: string;
    procedures: {
     bind?: any;
     func: Function;
    }[];
   }
  >
 >;
 constructor(public stateMachineData: StateMachineData<STATES>) {
  (this as any).states = {};
 }

 isStateActive(state: keyof STATES) {
  return this.activeState == state;
 }

 registerState<STATE extends keyof STATES, EVENT extends keyof STATES[STATE]>(
  state: STATE,
  event: Record<EVENT, keyof STATES>
 ) {
  (this as any).states[state] = {};
  for (const eventKey of Object.keys(event)) {
   (this as any).states[state][eventKey] = {
    nextState: (event as any)[eventKey],
    procedures: [],
   };
  }
 }

 triggerEventOnState<
  STATE extends keyof STATES,
  EVENT extends keyof STATES[STATE],
  ARGS extends STATES[STATE][EVENT]
 >(state: STATE, event: EVENT, args: ARGS) {
  if (!this.states[state]) {
   throw new Error(
    `The state ${state} does not exist: machine- ${this.stateMachineData.name}.`
   );
  }
  if (!(this as any).states[state][event]) {
   throw new Error(
    `The event ${event} does not exist on the state ${state}.: machine-> ${this.stateMachineData.name} data.`
   );
  }
  
  const procedures = (this as any).states[state][event].procedures;
  for (const procedure of procedures) {
   if (procedure.bind && typeof procedure.bind == "object") {
    procedure.func.call(procedure.bind, args);
   } else {
    procedure.func(args);
   }
  }

  if (this.stateMachineData.historyLength > 0) {
   if (this.history.length > this.stateMachineData.historyLength) {
    this.history.shift();
   }
   (this as any).history.push({
    previousState: this.activeState,
    newState: state,
    event: event,
   });
  }
  this.activeState = state;
 }

 addToStateEvent<
  STATE extends keyof STATES,
  EVENT extends keyof STATES[STATE],
  ARGS extends STATES[STATE][EVENT]
 >(state: STATE, event: EVENT, func: (args: ARGS) => void, bind?: any) {
  if (!this.states[state]) {
   throw new Error(
    `The state ${state} does not exist: machine- ${this.stateMachineData.name}.`
   );
  }
  if (!(this as any).states[state][event]) {
   throw new Error(
    `The event ${event} does not exist on the state ${state}.: machine-> ${this.stateMachineData.name} data.`
   );
  }
  (this as any).states[state][event].procedures.push({
   bind: bind,
   func: func,
  });
 }
}
