export namespace Calculator {
  export interface ProduceNextState {
    (state: State.STARTED): Promise<State.ENTER_FORMULA>;
    (state: State.ENTER_FORMULA): Promise<State.COMPLETED>;
  }

  export enum State {
    STARTED = "CALC_STARTED",
    ENTER_FORMULA = "CALC_ENTER_FORMULA",
    COMPLETED = "CALC_COMPLETED",
  }

  export type Context = Readonly<
    | { state: State.STARTED }
    | { state: State.ENTER_FORMULA }
    | { state: State.COMPLETED }
  >;
}

export default function createStateMachine() {
  return {
    calculator: (function () {
      return {
        nextState: (async (state: Calculator.State) => {
          switch (state) {
            case Calculator.State.STARTED:
              return Calculator.State.ENTER_FORMULA;

            case Calculator.State.ENTER_FORMULA:
            case Calculator.State.COMPLETED:
              return Calculator.State.COMPLETED;
          }
        }) as Calculator.ProduceNextState,
      };
    })(),
  };
}
