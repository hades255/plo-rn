import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { DrawGameNav } from '../types/navigation';

type Play = {
  id: string;
  numbers: number[];
  bonus: number | null;
  quickPick: boolean;
};

type State = {
  game: DrawGameNav | null;
  settings: {
    draws: number;
  };
  draft: {
    numbers: number[];
    bonus: number | null;
  };
  plays: Play[];
  order: {
    lastOrderId: string | null;
    serviceFee: number;
  };
};

type Action =
  | { type: 'SET_GAME'; game: DrawGameNav | null }
  | { type: 'SET_DRAWS'; draws: number }
  | { type: 'SET_DRAFT_NUMBERS'; numbers: number[] }
  | { type: 'SET_DRAFT_BONUS'; bonus: number | null }
  | { type: 'RESET_DRAFT' }
  | { type: 'ADD_PLAY'; play: Play }
  | { type: 'REMOVE_PLAY'; id: string }
  | { type: 'CLEAR_PLAYS' }
  | { type: 'SET_LAST_ORDER'; orderId: string | null }
  | { type: 'SET_SERVICE_FEE'; serviceFee: number }
  | { type: 'CLEAR_ALL' };

const initialState: State = {
  game: null,
  settings: { draws: 1 },
  draft: { numbers: [], bonus: null },
  plays: [],
  order: { lastOrderId: null, serviceFee: 0 },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_GAME':
      return { ...state, game: action.game };
    case 'SET_DRAWS':
      return { ...state, settings: { ...state.settings, draws: action.draws } };
    case 'SET_DRAFT_NUMBERS':
      return { ...state, draft: { ...state.draft, numbers: action.numbers } };
    case 'SET_DRAFT_BONUS':
      return { ...state, draft: { ...state.draft, bonus: action.bonus } };
    case 'RESET_DRAFT':
      return { ...state, draft: { numbers: [], bonus: null } };
    case 'ADD_PLAY':
      return {
        ...state,
        plays: [...state.plays, action.play],
        draft: { numbers: [], bonus: null },
      };
    case 'REMOVE_PLAY':
      return { ...state, plays: state.plays.filter(p => p.id !== action.id) };
    case 'CLEAR_PLAYS':
      return { ...state, plays: [], draft: { numbers: [], bonus: null } };
    case 'SET_LAST_ORDER':
      return { ...state, order: { ...state.order, lastOrderId: action.orderId } };
    case 'SET_SERVICE_FEE':
      return { ...state, order: { ...state.order, serviceFee: action.serviceFee } };
    case 'CLEAR_ALL':
      return { ...initialState };
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const GameFlowContext = createContext<Ctx>({
  state: initialState,
  dispatch: () => {},
});

export function GameFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameFlowContext.Provider value={value}>{children}</GameFlowContext.Provider>;
}

export function useGameFlow() {
  return useContext(GameFlowContext);
}
