import "../assets/css/checkout.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddAddress from "./addAddress";

const ShippingAddress = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]); // Danh sách địa chỉ
  const [selectedAddress, setSelectedAddress] = useState(null); // Địa chỉ đã chọn
  const [showPopup, setShowPopup] = useState(false); // Trạng thái hiển thị popup
  const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị modal thêm địa chỉ
  const [editedAddress, setEditedAddress] = useState(null); // Địa chỉ được chỉnh sửa

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId || !token) {
        console.error("User ID or token is missing");
        alert("Bạn cần đăng nhập để truy cập tính năng này.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8081/api/users/${userId}/addresses`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Gửi token trong header
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch addresses");

        const data = await response.json();
        setAddresses(data.data); // Lưu danh sách địa chỉ vào state
        if (data.data.length > 0) {
          setSelectedAddress(data.data[0]); // Chọn địa chỉ đầu tiên mặc định
          sessionStorage.setItem(
            "selectedAddress",
            JSON.stringify(selectedAddress)
          );
          console.log("selectedAddress", selectedAddress);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, [userId, token]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    sessionStorage.setItem("selectedAddress", JSON.stringify(address));
    const storedAddress = JSON.parse(sessionStorage.getItem("selectedAddress"));
    console.log("sessison", storedAddress);
    setShowPopup(false); // Đóng popup sau khi chọn địa chỉ
  };

  const handlePopupOpen = (address) => {
    setEditedAddress(address);
    setShowPopup(true); // Mở popup khi muốn sửa địa chỉ
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setEditedAddress(null);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    if (!editedAddress) return;

    try {
      const response = await fetch(
        `http://localhost:8081/api/${userId}/addresses/${editedAddress.addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedAddress),
        }
      );
      if (!response.ok) throw new Error("Failed to update address");

      const updatedAddress = await response.json();

      // Cập nhật lại danh sách địa chỉ và địa chỉ đã chọn
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.addressId === updatedAddress.addressId ? updatedAddress : addr
        )
      );
      setSelectedAddress(updatedAddress); // Cập nhật địa chỉ đã chọn
      console.log("địa chỉ", selectedAddress);
      handlePopupClose(); // Đóng popup sau khi lưu thành công
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  if (!addresses.length) {
    return <div>Chưa có địa chỉ</div>; // Hoặc có thể hiển thị thông báo lỗi
  }

  return (
    <div className="shipping-address border border-light p-3 mb-3">
      <h3 className="title font-weight-bold mb-2">Địa chỉ giao hàng</h3>
      <div
        className="edit text-primary float-end"
        style={{ cursor: "pointer" }}
        onClick={() => handlePopupOpen(selectedAddress)} // Mở popup để sửa địa chỉ
      >
        Thay đổi
      </div>
      <div>
        {selectedAddress && (
          <>
            <div>
              <strong className="mr-2">{selectedAddress.customerName}</strong>
              {selectedAddress.phoneNumber}
            </div>

            <div>{selectedAddress.address}</div>
            <div>
              {selectedAddress.ward.wardName},
              {selectedAddress.district.districtName},
              {selectedAddress.province.provinceName}
            </div>
          </>
        )}
      </div>
      {/* Popup cho việc chọn hoặc sửa địa chỉ */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 className="popup-title">Địa chỉ của tôi</h3>
            <div className="address-list">
              {addresses.map((address) => (
                <div
                  key={address.addressId}
                  className={`address-item ${
                    selectedAddress?.addressId === address.addressId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleAddressSelect(address)} // Chọn địa chỉ khi nhấp vào
                >
                  <div className="address-header">
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddress?.addressId === address.addressId}
                      onChange={() => handleAddressSelect(address)}
                    />
                    <strong className="customer-name">
                      {address.customerName}
                    </strong>
                    <span className="phone-number">{address.phoneNumber}</span>
                    <AddAddress />
                  </div>
                  <div className="address-detail">
                    {address.address}, {address.ward.wardName},{" "}
                    {address.district.districtName},{" "}
                    {address.province.provinceName}
                  </div>
                </div>
              ))}
            </div>
            <div className="popup-footer">
              <button className="btn btn-secondary" onClick={handlePopupClose}>
                Hủy
              </button>
              <button className="btn btn-danger" onClick={handlePopupClose}>
                <AddAddress />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddress;
