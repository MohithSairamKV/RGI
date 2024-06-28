// Home.js
import React from 'react';
import HomeHeader from './HomeHeader';
import HomeContent from './HomeContent';
import HomeFooter from './HomeFooter';

const Home = ({ onLogin }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif' }}>
      <HomeHeader />
      <HomeContent onLogin={onLogin} />
      <HomeFooter />
      <div style={{ height: '50px' }}></div> {/* Empty space at the bottom */}
    </div>
  );
};

export default Home;
