import type { StateMachineData } from "./Meta/StateMachine.data.types";
import { StateMachine } from "./StateMachine.js";

export const CrystallineState = {
 createStateMachine<STATES>(stateMachineData: StateMachineData<STATES>) {
  const stateMachine = new StateMachine<STATES>(stateMachineData);
  return stateMachine;
 },
 
};
