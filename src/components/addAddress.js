import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/addAddress.css";

const AddAddress = () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false); // state điều khiển popup

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/provinces");
        setProvinces(response.data.data.content);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    // Fetch districts khi tỉnh thay đổi
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/provinces/${selectedProvince}/districts`
          );
          setDistricts(response.data.data.content);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    // Fetch wards khi quận/huyện thay đổi
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/districts/${selectedDistrict}/wards`
          );
          setWards(response.data.data.content);
        } catch (error) {
          console.error("Error fetching wards:", error);
        }
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error trước khi gửi

    if (!customerName || !phoneNumber || !address || !selectedWard) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const newAddress = {
      customerName,
      phoneNumber,
      address,
      provinceId: selectedProvince,
      districtId: selectedDistrict,
      wardId: selectedWard,
    };

    try {
      const response = await axios.post(
        `http://localhost:8081/api/users/${userId}/addresses`,
        newAddress,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message);

      // Reset form sau khi thành công
      setCustomerName("");
      setPhoneNumber("");
      setAddress("");
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      setShowPopup(false); // Đóng popup sau khi thành công
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data.errors;
        let errorMessages = [];
        if (errorData) {
          if (errorData.customerName)
            errorMessages.push(`Tên khách hàng: ${errorData.customerName}`);
          if (errorData.phoneNumber)
            errorMessages.push(`Số điện thoại: ${errorData.phoneNumber}`);
          if (errorData.address)
            errorMessages.push(`Địa chỉ: ${errorData.address}`);
          if (errorData.provinceId)
            errorMessages.push(`Tỉnh: ${errorData.provinceId}`);
          if (errorData.districtId)
            errorMessages.push(`Quận/Huyện: ${errorData.districtId}`);
          if (errorData.wardId)
            errorMessages.push(`Phường/Xã: ${errorData.wardId}`);
          setError(errorMessages.join(", "));
        }
      } else {
        setError("Đã xảy ra lỗi khi thêm địa chỉ.");
      }
    }
  };

  return (
    <div className="container col-8">
      <small
        onClick={() => setShowPopup(true)} // Mở popup khi nhấn nút
      >
        Thêm địa chỉ
      </small>
      {/* Popup hiển thị khi người dùng nhấn nút "Thêm địa chỉ" */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup ">
            <h2>Thêm địa chỉ</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  className="form-control"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <select
                  className="form-control"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  required
                >
                  <option value="">Chọn tỉnh</option>
                  {provinces.map((province) => (
                    <option
                      key={province.provinceId}
                      value={province.provinceId}
                    >
                      {province.provinceName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quận/Huyện</label>
                <select
                  className="form-control"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  required
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option
                      key={district.districtId}
                      value={district.districtId}
                    >
                      {district.districtName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Phường/Xã</label>
                <select
                  className="form-control"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  required
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.wardId} value={ward.wardId}>
                      {ward.wardName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex">
                <button type="submit" className="btn btn-primary w-100">
                  Thêm địa chỉ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={() => setShowPopup(false)} // Đóng popup
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAddress;
