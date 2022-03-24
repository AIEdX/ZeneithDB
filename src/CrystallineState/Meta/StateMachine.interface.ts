export type StateEventMap<T> = Record<string, T>;

export interface StateMachineInterface<T> {
  isStateActive(state: T): boolean;

  triggerEventOnState<EVENT, ARGS = {}>(
    state: T,
    event: EVENT,
    args?: ARGS
  ): void;

  addToStateEvent<EVENT, ARGS = {}>(
    state: T,
    event: EVENT,
    func: (args: ARGS) => any,
    bind: any
  ): void;
  
}
