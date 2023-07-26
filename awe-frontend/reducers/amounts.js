import {
  ADD_CART_ITEMS,
  REMOVE_CART_ITEMS,
  SET_CART_ITEMS,
  TRIGGER_CART_UPDATE,
  ADD_ORDER_ITEMS,
  REMOVE_ORDER_ITEMS,
  SET_ORDER_ITEMS,
  ADD_LISTING_ITEMS,
  REMOVE_LISTING_ITEMS,
  SET_LISTING_ITEMS,
  ADD_PENDING_ITEMS,
  REMOVE_PENDING_ITEMS,
  SET_PENDING_ITEMS,
} from '../actions/types';

const initialState = {
  cartItems: 0,
  cartUpdateListener: false,
  orderItems: 0,
  listingItems: 0,
  pendingItems: 0,
};

const amountsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case ADD_CART_ITEMS:
      return {
        ...state,
        cartItems: state.cartItems + payload
      }
    case REMOVE_CART_ITEMS:
      return {
        ...state,
        cartItems: state.cartItems - payload
      }
    case SET_CART_ITEMS:
      return {
        ...state,
        cartItems: payload
      }
    case TRIGGER_CART_UPDATE:
      return {
        ...state,
        cartUpdateListener: !state.cartUpdateListener
      }
    case ADD_ORDER_ITEMS:
      return {
        ...state,
        orderItems: state.orderItems + 1
      }
    case REMOVE_ORDER_ITEMS:
      return {
        ...state,
        orderItems: state.orderItems - 1
      }
    case SET_ORDER_ITEMS:
      return {
        ...state,
        orderItems: payload
      }
    case ADD_LISTING_ITEMS:
      return {
        ...state,
        listingItems: state.listingItems + 1
      }
    case REMOVE_LISTING_ITEMS:
      return {
        ...state,
        listingItems: state.listingItems - 1
      }
    case SET_LISTING_ITEMS:
      return {
        ...state,
        listingItems: payload
      }
    case ADD_PENDING_ITEMS:
      return {
        ...state,
        pendingItems: state.pendingItems + 1
      }
    case REMOVE_PENDING_ITEMS:
      return {
        ...state,
        pendingItems: state.pendingItems - 1
      }
    case SET_PENDING_ITEMS:
      return {
        ...state,
        pendingItems: payload
      }
    default:
      return state;
  }
};

export default amountsReducer