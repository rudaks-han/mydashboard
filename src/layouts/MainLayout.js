import React from 'react';

import Header from './include/Header';
import Content from './include/Content';
import Footer from './include/Footer';

const MainLayout = () => {
    return (
        <div>
            <Header/>
            <Content />
            <Footer />
        </div>
    );
};

export { MainLayout };
