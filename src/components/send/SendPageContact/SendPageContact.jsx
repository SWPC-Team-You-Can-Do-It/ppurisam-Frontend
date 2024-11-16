import React, { useState, useContext } from "react";
import * as XLSX from 'xlsx';
import "./SendPageContact.css";
import AddressBookModal from './AddressBookModal';
import axiosInstance from "../../login/axiosInstance";
import { v4 as uuidv4 } from 'uuid';
import { ImageContext } from '../../../contexts/ImageContext';

const SendPageContact = ({ messageContent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [senderNumber, setSenderNumber] = useState('');
    const [isEditable, setIsEditable] = useState(true);
    const [phoneNumbers, setPhoneNumbers] = useState('');
    const [contactList, setContactList] = useState([]);
    const [messageTitle] = useState("");
    const [refKey] = useState(uuidv4().replace(/-/g, '').substring(0, 32));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const account = import.meta.env.VITE_REACT_APP_PPURIO_ACCOUNT;

    const { imageData } = useContext(ImageContext); // ImageContext 사용

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleRegisterSender = () => {
        if (senderNumber.trim()) {
            setIsEditable(false);
            handleContactUpdate(senderNumber, contactList);
        } else {
            alert('발신번호를 입력해주세요.');
        }
    };

    const handleDeleteSender = () => {
        setSenderNumber('');
        setIsEditable(true);
        handleContactUpdate('', contactList);
    };

    const handleAddNumbers = () => {
        const newNumbers = phoneNumbers
            .split('\n')
            .map((num) => num.trim())
            .filter((num) => num);

        const updatedList = [...contactList, ...newNumbers];
        setContactList(updatedList);
        setPhoneNumbers('');
        handleContactUpdate(senderNumber, updatedList);
    };

    const handleClearAll = () => {
        setContactList([]);
        handleContactUpdate(senderNumber, []);
    };

    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const numbers = sheetData.map(row => row[0]).filter(Boolean).join('\n');
            setPhoneNumbers(numbers);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSelectFromAddressBook = (selectedNumbers) => {
        const currentNumbers = phoneNumbers.split('\n').filter(Boolean);
        const allNumbers = Array.from(new Set([...currentNumbers, ...selectedNumbers]));
        setPhoneNumbers(allNumbers.join('\n'));
    };

    const handleContactUpdate = (sender, recipients) => {
    };

    const handleSendMessage = async () => {
        if (!senderNumber) {
            setError('발신번호를 입력해주세요.');
            return;
        }
        if (contactList.length === 0) {
            setError('수신번호를 입력해주세요.');
            return;
        }
        if (!messageContent && (!imageData || !imageData.fileName)) {
            setError('메시지 내용 또는 이미지를 입력해주세요.');
            return;
        }

        const formattedTargets = contactList.map((number, index) => ({
            to: number,
            name: `Name${index + 1}`,
            changeWord: { [`var${index + 1}`]: `Name${index + 1}` },
        }));

        let imagePayload = null;

        if (imageData?.fileName || imageData?.url) {
            try {
                imagePayload = {
                    name: imageData.fileName,
                    data: imageData.base64Data,
                    size: imageData.size,
                    url: imageData.url,
                };
            } catch (error) {
                console.error("이미지 로드 오류:", error);
                setError('이미지를 로드하는 중 오류가 발생했습니다.');
                return;
            }
        }

        const messageData = {
            account,
            messageType: imagePayload ? 'MMS' : 'SMS',
            content: messageContent || "",
            from: senderNumber,
            duplicateFlag: 'Y',
            targetCount: formattedTargets.length,
            targets: formattedTargets,
            refKey,
            rejectType: 'AD',
            sendTime: '',
            subject: messageTitle || undefined,
            files: imagePayload ? [imagePayload] : undefined,
        };

        console.log('Final messageData to send:', messageData);

        try {
            const response = await axiosInstance.post(`api/ppurio/send`, messageData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setSuccess('메시지가 성공적으로 전송되었습니다.');
            setError('');
        } catch (error) {
            console.error("메시지 전송 오류:", error.response ? error.response.data : error);
            setError('메시지 전송에 실패했습니다.');
        }
    };

    return (
        <div className="SendPageContact_contact-form-wrapper">

            {/* 발신번호 입력 */}
            <div className="SendPageContact_sender-section2">
                <h2>발신번호</h2>
                <div className="SendPageContact_sender-input-wrapper">
                    <input
                        type="text"
                        className="SendPageContact_input-field"
                        placeholder="발신번호를 입력해주세요"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        disabled={!isEditable}
                    />
                    <div className="SendPageContact_sender-buttons">
                        <button className="SendPageContact_delete-button" onClick={handleDeleteSender}>삭제</button>
                        <button className="SendPageContact_register-button" onClick={handleRegisterSender}>발신번호 등록</button>
                    </div>
                </div>
            </div>

            {/* 수신번호 입력 및 연락처 */}
            <div className="SendPageContact_receiver-contact-wrapper">
                <div className="SendPageContact_receiver-section">
                    <h2>수신번호 입력</h2>
                    <div className="SendPageContact_receiver-buttons">
                        <button className="SendPageContact_address-button" onClick={openModal}>주소록</button>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleExcelUpload}
                            style={{ display: 'none' }}
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="SendPageContact_excel-button">
                            엑셀 붙여넣기
                        </label>
                    </div>
                    <textarea
                        className="SendPageContact_phone-input"
                        placeholder="휴대폰번호 입력 후 엔터 1만 건까지 붙여넣기 가능"
                        value={phoneNumbers}
                        onChange={(e) => setPhoneNumbers(e.target.value)}
                    />
                    <button className="SendPageContact_add-number-button" onClick={handleAddNumbers}>번호 추가+</button>
                </div>

                {/* 연락처 목록 */}
                <div className="SendPageContact_contact-list-section">
                    <div className="SendPageContact_contact-list-header">
                        <h2>받는사람</h2>
                        <button className="SendPageContact_clear-all-button" onClick={handleClearAll}>전체 제거</button>
                    </div>
                    <div className="SendPageContact_table-scroll-wrapper">
                        <table className="SendPageContact_contact-table">
                            <thead>
                            <tr>
                                <th>연락처</th>
                            </tr>
                            </thead>
                            <tbody>
                            {contactList.map((number, index) => (
                                <tr key={index}>
                                    <td>{number}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 발송 버튼 */}
            <button className="SendPageContact_submit-button2" onClick={handleSendMessage}>
                발송하기
            </button>

            {/* 피드백 메시지 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {/* 주소록 모달 */}
            <AddressBookModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSelect={handleSelectFromAddressBook}
            />
        </div>
    );
};

export default SendPageContact;
