import React, { useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, value, onChange }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    const firstEmptyInput = inputRefs.current.find(input => !input.value);
    if (firstEmptyInput) {
      firstEmptyInput.focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const newOtp = [...value];
    newOtp[index] = e.target.value.slice(-1); 
    onChange(newOtp.join(''));

    if (e.target.value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    onChange(pastedData);
  };

  return (
    <div className="flex justify-center items-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength="1"
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none transition-all"
        />
      ))}
    </div>
  );
};

export default OtpInput;