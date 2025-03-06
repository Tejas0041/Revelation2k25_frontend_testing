import React from 'react';
import '../css/PaymentSection.css';

const PaymentSection = ({ amount, onImageUpload }) => {
  return (
    <div className="payment-section">
      <h4>Payment Details</h4>
      <p className="amount">Registration Amount: ₹{amount}</p>
      <img 
        src="https://skynyxtech.com/wp-content/uploads/2024/09/gpay.png" // Replace with your actual QR code
        alt="Payment QR Code"
        className="qr-code"
      />
      <div className="form-group">
        <label>Upload Payment Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageUpload(e.target.files[0])}
          required
        />
      </div>
      <p className="payment-note">
        Please scan the QR code and make the payment before proceeding.
        Upload the screenshot of your payment as proof.
      </p>
    </div>
  );
};

export default PaymentSection;
