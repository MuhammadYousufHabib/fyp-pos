const intialState = {
  loading: false,
  cartItems: [],
  user: {},
  isLogin: null,
  role: null,
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
      case "Empty_CART":
        return {
          ...state,
          cartItems: []
        };

    case "USER_LOGIN": {
      console.log("here its " + action.payload.name, action.payload.isAdmin);
      if (action.payload.name && action.payload?.email) {
        console.log(
          "wayl",
          action.payload.name,
          action.payload.isAdmin,
          action.payload._id
        );
        const role = action.payload?.isAdmin ? "admin" : "user";
        const user = {
          firstname: action.payload.name,
          email: action.payload?.email,
          _id: action.payload?._id,
        };
        return { ...state, isLogin: true, role: role, user: user };
      }
    }

    case "USER_LOGOUT": {
      return { ...state, isLogin: false, role: null, user: null };
    }
    default:
      return state;
  }
};
