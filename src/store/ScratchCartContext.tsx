import React, { createContext, useContext, useMemo, useReducer } from 'react';

type ScratchCartItem = {
  gameId: string;
  title: string;
  price: number;
  image?: string;
  topPrize?: number;
  quantity: number;
};

type ScratchCartState = {
  items: ScratchCartItem[];
};

type Action =
  | {
      type: 'ADD_ITEM';
      gameId: string;
      title: string;
      price: number;
      image?: string;
      topPrize?: number;
    }
  | { type: 'UPDATE_QUANTITY'; gameId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; gameId: string };

const initialState: ScratchCartState = { items: [] };

function reducer(state: ScratchCartState, action: Action): ScratchCartState {
  if (action.type === 'ADD_ITEM') {
    const idx = state.items.findIndex(i => i.gameId === action.gameId);
    if (idx >= 0) {
      const copy = [...state.items];
      copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
      return { items: copy };
    }
    return {
      items: [
        ...state.items,
        {
          gameId: action.gameId,
          title: action.title,
          price: action.price,
          image: action.image,
          topPrize: action.topPrize,
          quantity: 1,
        },
      ],
    };
  }
  if (action.type === 'UPDATE_QUANTITY') {
    if (action.quantity <= 0) {
      return { items: state.items.filter(i => i.gameId !== action.gameId) };
    }
    return {
      items: state.items.map(i =>
        i.gameId === action.gameId ? { ...i, quantity: action.quantity } : i,
      ),
    };
  }
  if (action.type === 'REMOVE_ITEM') {
    return { items: state.items.filter(i => i.gameId !== action.gameId) };
  }
  return state;
}

type ScratchCartContextValue = {
  state: ScratchCartState;
  dispatch: React.Dispatch<Action>;
};

const ScratchCartContext = createContext<ScratchCartContextValue>({
  state: initialState,
  dispatch: () => {},
});

export function ScratchCartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <ScratchCartContext.Provider value={value}>
      {children}
    </ScratchCartContext.Provider>
  );
}

export function useScratchCart() {
  return useContext(ScratchCartContext);
}
