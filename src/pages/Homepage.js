import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/product.css";

import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Product = ({ setCartCount }) => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 12; // Số lượng sản phẩm tối đa trên mỗi trang
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [notification, setNotification] = useState(null);

  const images = [
    require("../assets/images/banner1.jpg"),
    require("../assets/images/banner2.jpg"),
    require("../assets/images/banner3.jpg"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, [images.length]);
  const fetchProducts = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/products?page=${page}&limit=${limit}`
      );
      const data = response.data.data;
      console.log("data", data);
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching products for page:", currentPage);
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (product) => {
    if (!product.productId || !product.productName || !product.currentPrice) {
      alert("Sản phẩm thiếu thông tin, không thể thêm vào giỏ hàng!");
      return;
    }

    dispatch(addToCart(product));
    // Hiển thị thông báo
    setNotification(`Đã thêm 1 sản phẩm vào giỏ hàng!`);
    setTimeout(() => setNotification(null), 500); // Tự động ẩn sau 1.5 giây (1500 ms)
  };

  return (
    <div className="container-fluid px-0">
      <div className="banner row px-0">
        <div
          id="carouselExampleAutoplaying"
          className="carousel slide px-0"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner px-0">
            {images.map((image, index) => (
              <div
                className={`carousel-item ${
                  index === activeIndex ? "active" : ""
                }`}
                key={index}
              >
                <img
                  src={image}
                  className="d-block w-100"
                  alt={`Banner ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      <div className="product">
        <div className="row">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="product-card" key={product.productId}>
                <div className="image-container">
                  <img
                    src={product.mainImageUrl}
                    alt={product.productName}
                    className="product-image"
                  />
                  <div className="overlay">
                    <h3>Xem chi tiết</h3>
                  </div>
                </div>

                <div className="product-info">
                  <h5 className="product-name">{product.productName}</h5>
                  <p className="product-price mt-2 ">
                    {product.currentPrice.newPrice.toLocaleString()} VND
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{ marginLeft: "10px" }}
                    >
                      <i className="fa fa-shopping-cart position-relative" />
                    </button>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col text-center">
              <p>Không có sản phẩm nào.</p>
            </div>
          )}
        </div>

        {/* Hiển thị thanh chọn trang nếu có nhiều hơn 1 trang */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  className={`page-item ${
                    currentPage === index ? "active" : ""
                  }`}
                  key={index}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      {/* Notification Popup */}
      {notification && (
        <div className="notification-container p-3">
          <div className="notification-message">{notification}</div>
        </div>
      )}
    </div>
  );
};

export default Product;
