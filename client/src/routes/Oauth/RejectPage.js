import React, { useEffect } from 'react';
import RejectPage from './PageLayout';
import SadLienImg from 'assets/img/kakao/sadLien.jpeg';
import { useNavigate } from 'react-router-dom';

function Reject() {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, []);

  return (
    <RejectPage
      title="앗!... 이미 가입된 계정이에요! 잠시 뒤 홈으로 갑니다!"
      img={SadLienImg}
      styleOptions={{ rotate: false }}
    />
  );
}

export default Reject;
