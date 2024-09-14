const intialState = {
  loading: false,
  cartItems: [],
};

export const rootReducer = (state = intialState, action) => {
  switch (action.type) {
    case "SHOW_LOADING":
      return {
        ...state,
        loading: true,
      };
    case "HIDE_LOADING":
      return {
        ...state,
        loading: false,
      };
    case "ADD_TO_CART":
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        // Update quantity if item exists
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x._id === existItem._id ? { ...x, quantity: x.quantity + 1 } : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    case "UPDATE_CART":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "DELETE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item._id !== action.payload._id
        ),
      };
    default:
      return state;
  }
};
