import { createSlice } from "@reduxjs/toolkit";

// Lấy giỏ hàng từ localStorage nếu có
const initialCart = JSON.parse(localStorage.getItem("cart")) || [];

const initialState = {
  cartCount: initialCart.reduce((acc, item) => acc + item.quantity, 0), // Tổng số lượng sản phẩm trong giỏ
  cartItems: initialCart, // Danh sách sản phẩm trong giỏ
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Chọn hoặc bỏ chọn sản phẩm
    toggleSelectProduct: (state, action) => {
      const productId = action.payload;
      const product = state.cartItems.find(
        (item) => item.productId === productId
      );
      if (product) {
        product.selected = !product.selected; // Đảo trạng thái selected
      }

      // Cập nhật lại localStorage sau khi thay đổi giỏ hàng
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    // Thêm sản phẩm vào giỏ
    addToCart: (state, action) => {
      const product = action.payload;
      const existingProduct = state.cartItems.find(
        (item) => item.productId === product.productId
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        state.cartItems.push({ ...product, quantity: 1, selected: true }); // Mặc định sản phẩm được chọn
      }

      // Cập nhật lại số lượng sản phẩm trong giỏ
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Cập nhật localStorage
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    // Xóa sản phẩm khỏi giỏ
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== productId
      );

      // Cập nhật lại số lượng sản phẩm trong giỏ
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Cập nhật localStorage
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    // Tăng/giảm số lượng sản phẩm
    updateQuantity: (state, action) => {
      const { productId, delta } = action.payload;
      const existingProduct = state.cartItems.find(
        (item) => item.productId === productId
      );

      if (existingProduct) {
        existingProduct.quantity = Math.max(
          1,
          existingProduct.quantity + delta
        ); // Không cho phép số lượng < 1

        // Kiểm tra nếu số lượng nhỏ hơn 1 thì xóa sản phẩm khỏi giỏ hàng
        if (existingProduct.quantity < 1) {
          state.cartItems = state.cartItems.filter(
            (item) => item.productId !== productId
          );
        }
      }
      // Cập nhật lại số lượng sản phẩm trong giỏ
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Cập nhật localStorage
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    // Đồng bộ Redux với localStorage khi ứng dụng khởi tạo
    syncCartWithLocalStorage: (state) => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      state.cartItems = savedCart;
      state.cartCount = savedCart.reduce((acc, item) => acc + item.quantity, 0);
    },

    // Xóa các sản phẩm được chọn
    removeSelectedItems: (state) => {
      state.cartItems = state.cartItems.filter((item) => !item.selected);
      state.cartCount = state.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      // Cập nhật localStorage
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleSelectProduct,
  syncCartWithLocalStorage,
  removeSelectedItems,
} = cartSlice.actions;

export default cartSlice.reducer;
