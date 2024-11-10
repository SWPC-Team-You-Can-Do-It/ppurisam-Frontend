// src/components/contact/InputContacts/InputContacts.jsx

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './InputContacts.css';
import arrowIcon from '../../../assets/images/contact/icon_arrow.png';
import uploadIcon from '../../../assets/images/contact/Upload.png';
import axiosInstance from '../../login/axiosInstance';

const InputContacts = () => {
    // 초기 빈 행 생성 함수
    const generateEmptyRows = (count) => {
        const rows = [];
        for (let i = 0; i < count; i++) {
            rows.push({ name: '', phone_number: '', memo: '' }); // 'phoneNumber' → 'phone_number'로 변경
        }
        return rows;
    };

    const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [uploadedContacts, setUploadedContacts] = useState(generateEmptyRows(10));
    const [folders, setFolders] = useState([]);
    const [error, setError] = useState('');
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 폴더 데이터 Fetching
    useEffect(() => {
        const fetchFolders = async () => {
            setIsLoadingFolders(true);
            try {
                const response = await axiosInstance.get('/api/groups');
                setFolders(response.data);
            } catch (err) {
                console.error('폴더 불러오기 오류:', err);
                setError('폴더를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoadingFolders(false);
            }
        };

        fetchFolders();
    }, []);

    // 선택된 폴더에 따른 연락처 Fetching
    useEffect(() => {
        const fetchContacts = async () => {
            if (!selectedFolder) {
                setUploadedContacts(generateEmptyRows(10));
                return;
            }
            setIsLoadingContacts(true);
            try {
                const response = await axiosInstance.get('/api/contacts', {
                    params: {
                        group_id: Number(selectedFolder), // 'groupId' → 'group_id'로 변경
                        page: 0,
                        size: 100000,
                        search: '',
                        sort: '등록 순'
                    }
                });

                console.log('Fetched Contacts:', response.data);

                const fetchedContacts = response.data.content || response.data;
                const filteredByGroup = fetchedContacts.filter(contact => contact.group_id === Number(selectedFolder));

                const formattedContacts = filteredByGroup.map(contact => ({
                    name: contact.name || '',
                    phone_number: contact.phone_number || '', // 'phoneNumber' → 'phone_number'로 변경
                    memo: contact.memo || ''
                }));

                const combinedContacts = [
                    ...formattedContacts,
                    ...generateEmptyRows(10)
                ];

                setUploadedContacts(combinedContacts);
                setError('');
            } catch (err) {
                console.error('연락처 불러오기 오류:', err);
                setError('연락처를 불러오는 중 오류가 발생했습니다.');
                setUploadedContacts(generateEmptyRows(10));
            } finally {
                setIsLoadingContacts(false);
            }
        };

        fetchContacts();
    }, [selectedFolder]);

    const toggleFolderDropdown = () => setIsFolderDropdownOpen(!isFolderDropdownOpen);

    const handleFolderSelect = (folder) => {
        setSelectedFolder(folder.id);
        setIsFolderDropdownOpen(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: ['name', 'phone_number', 'memo'], defval: '' });

                    const validContacts = json.map(contact => ({
                        name: contact.name || '',
                        phone_number: contact.phone_number || '',
                        memo: contact.memo || ''
                    })).filter(contact => contact !== undefined && contact !== null);

                    const formattedContacts = validContacts.map(contact => ({
                        name: contact.name,
                        phone_number: contact.phone_number.replace(/-/g, ''), // 하이픈 제거
                        memo: contact.memo
                    }));

                    const existingContacts = uploadedContacts.filter(contact => contact.name || contact.phone_number || contact.memo);

                    const combinedContacts = [
                        ...existingContacts,
                        ...formattedContacts,
                        ...generateEmptyRows(10)
                    ];

                    setUploadedContacts(combinedContacts);
                    setError('');
                } catch (err) {
                    console.error('엑셀 파일 처리 중 오류 발생:', err);
                    setError('엑셀 파일을 처리하는 중 오류가 발생했습니다.');
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleDeleteAll = () => {
        if (window.confirm('모든 연락처를 정말로 삭제하시겠습니까?')) {
            setUploadedContacts(generateEmptyRows(10));
        }
    };

    const handleSaveContacts = async () => {
        if (!selectedFolder) {
            alert('저장할 그룹을 선택하세요.');
            return;
        }

        const contactsToSave = uploadedContacts.filter(contact => contact.name.trim() || contact.phone_number.trim() || contact.memo.trim());

        if (contactsToSave.length === 0) {
            alert('저장할 연락처가 없습니다.');
            return;
        }

        setIsSaving(true);

        try {
            const savePromises = contactsToSave.map(contact => {
                const payload = {
                    name: contact.name,
                    phone_number: contact.phone_number,
                    memo: contact.memo,
                    group_id: Number(selectedFolder) // 'groupId' → 'group_id'로 변경
                };
                console.log('Saving contact:', payload);
                return axiosInstance.post('/api/contacts', payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            });

            const results = await Promise.allSettled(savePromises);

            const fulfilledCount = results.filter(result => result.status === 'fulfilled').length;
            const rejectedResults = results.filter(result => result.status === 'rejected');

            if (fulfilledCount > 0) {
                alert(`${fulfilledCount}개의 연락처가 성공적으로 저장되었습니다.`);
            }

            if (rejectedResults.length > 0) {
                const failedContacts = rejectedResults.map(result => {
                    if (result.reason.response && result.reason.response.data) {
                        return {
                            data: result.reason.config.data,
                            message: result.reason.response.data.message || '알 수 없는 오류'
                        };
                    }
                    return { data: result.reason.config.data, message: '알 수 없는 오류' };
                });
                alert(`${rejectedResults.length}개의 연락처 저장에 실패했습니다. 오류를 확인해주세요.`);
                console.error('실패한 연락처:', failedContacts);
            }

            const successfullySavedIndices = [];
            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    successfullySavedIndices.push(idx);
                }
            });

            const remainingContacts = uploadedContacts.filter((contact, idx) => !successfullySavedIndices.includes(idx));

            const combinedContacts = [
                ...remainingContacts,
                ...generateEmptyRows(10)
            ];

            setUploadedContacts(combinedContacts);
            setSelectedFolder('');
            setError('');
        } catch (err) {
            console.error('연락처 저장 오류:', err);
            setError('연락처를 저장하는 중 오류가 발생했습니다.');
            alert('연락처를 저장하는 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhoneChange = (index, value) => {
        let phone = value.replace(/[^0-9]/g, '');
        handleInputChange(index, 'phone_number', phone);
    };

    const handleInputChange = (index, field, value) => {
        const newContacts = [...uploadedContacts];
        if (!newContacts[index]) {
            newContacts[index] = { name: '', phone_number: '', memo: '' };
        }
        newContacts[index][field] = value;
        setUploadedContacts(newContacts);
    };

    return (
        <div className="InputContacts_wrapper">
            <div className="InputContacts_info">
                <p>엑셀에 저장된 번호를 하나의 그룹에 저장하는 기능입니다. (최대 5만건)</p>
                <p>이름 100byte, 번호 100byte, 메모 255byte 까지 입력 가능합니다.</p>
                <p>구분선(\, 약속#시( , W), 착신#으로) 등 특수문자가 포함될 경우 올바르게 저장되지 않을 수 있습니다.</p>
            </div>
            <div className="InputContacts_folder-upload-section">
                <div className="InputContacts_folder-sort">
                    <button onClick={toggleFolderDropdown} className="InputContacts_folder-sort-button">
                        {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : '그룹 선택'}
                        <img src={arrowIcon} alt="폴더 정렬 화살표" className="InputContacts_arrow-icon" />
                    </button>
                    {isFolderDropdownOpen && (
                        <ul className="InputContacts_dropdown-menu">
                            {folders.map((folder) => (
                                <li key={folder.id} onClick={() => handleFolderSelect(folder)}>
                                    {folder.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <label className="InputContacts_upload-button">
                    <img src={uploadIcon} alt="업로드 아이콘" className="InputContacts_upload-icon" />
                    엑셀 업로드
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="InputContacts_table-container">
                {isLoadingContacts ? (
                    <p>연락처를 불러오는 중...</p>
                ) : (
                    <table className="InputContacts_contact-table">
                        <thead>
                            <tr>
                                <th>이름</th>
                                <th>휴대폰</th>
                                <th>메모</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadedContacts.map((contact, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            value={contact.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            className="InputContacts_table-input"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={contact.phone_number}
                                            onChange={(e) => handlePhoneChange(index, e.target.value)}
                                            className="InputContacts_table-input"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={contact.memo}
                                            onChange={(e) => handleInputChange(index, 'memo', e.target.value)}
                                            className="InputContacts_table-input"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {uploadedContacts.length > 0 && (
                <div className="InputContacts_action-buttons">
                    {uploadedContacts.some(contact => contact.name.trim() || contact.phone_number.trim() || contact.memo.trim()) && (
                        <button className="InputContacts_delete-all-button" onClick={handleDeleteAll}>
                            전체삭제
                        </button>
                    )}
                    <button
                        className="InputContacts_save-button"
                        onClick={handleSaveContacts}
                        disabled={isSaving || isLoadingContacts}
                    >
                        {isSaving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            )}
        </div>
    );

};

export default InputContacts;
