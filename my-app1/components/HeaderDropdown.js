import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function DropDown({
    signOut
}) {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    return (<div onClick={() => {
        if (isDropdownVisible) {
            setIsDropdownVisible(false);
        }
        else {
            setIsDropdownVisible(true);
        }
    }} >
        <button
            id="dropdownButton"
            className="relative bg-blue-500 text-white px-4 py-2 rounded focus:shadow-outline focus:shadow-outline"
        >
            <FontAwesomeIcon icon={faUser} />
        </button>
        {isDropdownVisible && (
            <div
                id="dropdown"
                className="absolute mt-2 w-48 bg-white rounded-md shadow-lg right-0"

            >
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUser} /> My Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faCog} /> Settings
                </a>
                <a onClick={signOut} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
                </a>
            </div>
        )}
    </div>)
}

export default DropDown;