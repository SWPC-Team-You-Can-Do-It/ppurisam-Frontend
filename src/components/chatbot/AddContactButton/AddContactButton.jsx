// Frontend/src/components/chatbot/AddContactButton/AddContactButton.jsx

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import './AddContactButton.css';
import axiosInstance from '../../login/axiosInstance'; // API 연동을 위한 axios 인스턴스

const AddContactButton = forwardRef(({ addBotMessage, setChatState }, ref) => {
  const [chatStateInternal, setChatStateInternal] = useState('idle'); // 'idle', 'awaitingContactInput', 'awaitingGroupSelection'
  const [tempContact, setTempContact] = useState(null); // 임시로 저장할 연락처 정보
  const [groups, setGroups] = useState([]); // 그룹 목록

  // 부모 컴포넌트에서 호출할 수 있는 함수들
  useImperativeHandle(ref, () => ({
    // 연락처 추가 프로세스를 시작하는 함수
    startAddContact() {
      addBotMessage('추가할 연락처를 입력하여주세요(입력형식 - 이름: 전화번호)');
      setChatStateInternal('awaitingContactInput');
      setChatState('awaitingContactInput');
    },
    // 사용자 입력을 처리하는 함수
    handleUserInput(userInput) {
      if (chatStateInternal === 'awaitingContactInput') {
        // 연락처 입력 형식 검증
        const contactRegex = /^([^:]+):(\d{10,11})$/; // 예: 홍길동:01012345678
        const match = userInput.match(contactRegex);
        if (match) {
          const name = match[1].trim();
          const phone_number = match[2].trim();
          setTempContact({ name, phone_number });
          setChatStateInternal('awaitingGroupSelection');

          // 그룹 목록 가져오기
          axiosInstance.get('/api/groups')
            .then(response => {
              setGroups(response.data);
              const groupNames = response.data.map(group => group.name).join('\n');
              addBotMessage(`추가할 그룹을 선택해주세요\n그룹리스트:\n${groupNames}`);
              setChatState('awaitingGroupSelection');
            })
            .catch(err => {
              console.error('그룹 불러오기 오류:', err);
              addBotMessage('그룹을 불러오는 중 오류가 발생했습니다.');
              setChatStateInternal('idle');
              setChatState('idle');
              setTempContact(null);
            });
        } else {
          addBotMessage('입력 형식이 올바르지 않습니다. 다시 입력해주세요.\n예: 홍길동:01012345678');
        }
      }
      else if (chatStateInternal === 'awaitingGroupSelection') {
        // 선택한 그룹 처리
        const selectedGroup = groups.find(group => group.name.toLowerCase() === userInput.toLowerCase().trim());
        if (selectedGroup) {
          // 연락처 저장하기
          axiosInstance.post('/api/contacts', {
            name: tempContact.name,
            phone_number: tempContact.phone_number,
            group_id: selectedGroup.id,
          })
          .then(() => {
            addBotMessage(`연락처가 성공적으로 추가되었습니다\n: ${tempContact.name} (${tempContact.phone_number})`);
            setChatStateInternal('idle');
            setChatState('idle');
            setTempContact(null);
            setGroups([]);
          })
          .catch(err => {
            console.error('연락처 저장 오류:', err);
            addBotMessage('연락처를 저장하는 중 오류가 발생했습니다.');
            setChatStateInternal('idle');
            setChatState('idle');
            setTempContact(null);
            setGroups([]);
          });
        } else {
          addBotMessage('유효한 그룹을 선택해주세요.');
        }
      }
    }
  }));

  return (
    <button className="add-contact-button" onClick={() => {
      if (ref.current) {
        ref.current.startAddContact();
      }
    }}>
      연락처 추가
    </button>
  );
});

export default AddContactButton;
