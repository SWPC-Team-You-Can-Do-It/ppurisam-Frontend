// src/components/contact/EditContactModal/EditContactModal.jsx
import React, { useState, useEffect } from 'react';
import './EditContactModal.css';
import axiosInstance from '../../login/axiosInstance'; // axiosInstance 임포트

const EditContactModal = ({ contact, onClose, onUpdate }) => {
    const [name, setName] = useState(contact.name);
    const [phone_number, setPhoneNumber] = useState(contact.phone_number);
    const [memo, setMemo] = useState(contact.memo);
    const [group_id, setGroupId] = useState(contact.group_id || '');

    const [folders, setFolders] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 관리

    // 폴더 데이터 Fetching
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await axiosInstance.get('/api/groups');
                setFolders(response.data);
            } catch (err) {
                console.error('폴더 불러오기 오류:', err);
                setError('폴더를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchFolders();
    }, []);

    const handleSubmit = async () => {
        if (name.trim() === '' || phone_number.trim() === '') {
            alert('이름과 전화번호는 필수 항목입니다.');
            return;
        }

        const updatedData = { 
            name: name.trim(), 
            phone_number: phone_number.trim(), 
            memo: memo.trim(),
            group_id: group_id ? Number(group_id) : null // 그룹 선택 여부에 따라 처리
        };

        setIsSubmitting(true); // 제출 시작

        try {
            const response = await axiosInstance.put(`/api/contacts/${contact.id}`, updatedData);
            onUpdate(contact.id, response.data);
            alert('연락처가 성공적으로 수정되었습니다.');
            onClose();
        } catch (err) {
            console.error('연락처 수정 오류:', err);
            setError('연락처를 수정하는 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false); // 제출 종료
        }
    };

    return (
        <div className="EditContactModal_overlay">
            <div className="EditContactModal_content">
                <button className="EditContactModal_close-button" onClick={onClose} aria-label="닫기">
                    &times;
                </button>
                <h2>연락처 수정</h2>
                <div className="EditContactModal_form">
                    <label>
                        이름<span className="required">*</span>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </label>
                    <label>
                        전화번호<span className="required">*</span>
                        <input 
                            type="text" 
                            value={phone_number} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                        />
                    </label>
                    <label>
                        메모
                        <textarea 
                            value={memo} 
                            onChange={(e) => setMemo(e.target.value)} 
                        />
                    </label>
                    <label>
                        그룹
                        <select 
                            value={group_id} 
                            onChange={(e) => setGroupId(e.target.value)} 
                        >
                            <option value="">미분류</option>
                            {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                    </label>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="EditContactModal_actions">
                    <button 
                        className="EditContactModal_save-button" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '수정 중...' : '수정'}
                    </button>
                    <button 
                        className="EditContactModal_cancel-button" 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditContactModal;
