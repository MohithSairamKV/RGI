// OrderContext.js

import React, { createContext, useContext, useReducer } from 'react';

// Define your initial state
const initialState = {
  // Your initial state properties
};

// Define your reducer function
const orderReducer = (state, action) => {
  // Handle different actions to update the state
  switch (action.type) {
    // Example case:
    // case 'UPDATE_ORDER':
    //   return { ...state, order: action.payload };
    default:
      return state;
  }
};

const OrderContext = createContext();

const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const value = {
    state,
    dispatch,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export { OrderContext, OrderProvider, useOrder };
