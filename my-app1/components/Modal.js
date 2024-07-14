import React, { useEffect, useRef } from 'react';


export default function Modal({ isOpen, onClose, children }) {
    const modalContentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
                onClose(); // Close the modal if the click is outside
            }
        };

        // Add when the modal is open and clean up on close
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]); // Re-run when isOpen changes

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content" ref={modalContentRef}>
                <button onClick={onClose}>Close</button>
                {children}
            </div>
        </div>
    );
}