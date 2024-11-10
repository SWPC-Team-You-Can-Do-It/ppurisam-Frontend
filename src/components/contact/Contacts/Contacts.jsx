// src/components/contact/Contacts/Contacts.jsx
import React, { useState } from 'react';
import ManageContacts from '../ManageContacts/ManageContacts';
import InputContacts from '../InputContacts/InputContacts';
import './Contacts.css';

const Contacts = () => {
    const [currentTab, setCurrentTab] = useState('manage');

    return (
        <div className="Contacts_wrapper">
            <div className="Contacts_tab-menu">
                <span
                    className={`Contacts_tab-item ${currentTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('manage')}
                >
                    주소록 관리
                </span>
                <span
                    className={`Contacts_tab-item ${currentTab === 'input' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('input')}
                >
                    주소록 입력
                </span>
            </div>

            <div className="Contacts_main-content">
                {currentTab === 'manage' && <ManageContacts />}
                {currentTab === 'input' && <InputContacts />}
            </div>
        </div>
    );
};

export default Contacts;
