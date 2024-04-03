import React, { useState } from 'react';
import AlphabetGenerator from './AlphabetGenerator'; // Import your AlphabetGenerator component
import AnimalSounds from './AnimalSounds';

const PreKWorksheets = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedSubMenuItem, setSelectedSubMenuItem] = useState(null);

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setSelectedSubMenuItem(null); // Reset selected sub-menu item when parent menu item is clicked
  };

  const handleSubMenuItemClick = (subMenuItem) => {
    setSelectedSubMenuItem(subMenuItem);
  };

  const renderSubMenu = () => {
    switch (selectedSubMenuItem) {
        case 'Capital':
            return <AlphabetGenerator type="Capital" />;
        case 'Small':
            return <AlphabetGenerator type="Small" />;
        case 'Cursive':
            return <AlphabetGenerator type="Cursive" />;
        case 'Animal Sounds':
            return <AnimalSounds />;
        default:
            return null;
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <nav role="navigation" aria-labelledby="block-prekmenu-2-menu" id="block-prekmenu-2">
          <h2 id="block-prekmenu-2-menu">Pre-K Worksheets</h2>
          <ul className="menu odd menu-level-1">
            <li className="menu-item menu-item--expanded menu-item--active-trail">
              <a href="#" onClick={() => handleMenuItemClick('Alphabets')}>Alphabets</a>
              <ul className="submenu">
                <li className="menu-item menu-item--collapsed">
                  <a href="#" onClick={() => handleSubMenuItemClick('Capital')}>Capital</a>
                </li>
                <li className="menu-item menu-item--collapsed">
                  <a href="#" onClick={() => handleSubMenuItemClick('Small')}>Small</a>
                </li>
                <li className="menu-item menu-item--collapsed">
                  <a href="#" onClick={() => handleSubMenuItemClick('Cursive')}>Cursive</a>
                </li>
              </ul>
            </li>
            <li className="menu-item menu-item--collapsed">
              <a href="#" onClick={() => handleMenuItemClick('Sounds / Phonics')}>Sounds / Phonics</a>
              <ul className="submenu">
                <li className="menu-item menu-item--collapsed">
                  <a href="#" onClick={() => handleSubMenuItemClick('Animal Sounds')}>Animal Sounds</a>
                </li>
                </ul>
            </li>
            {/* Add other menu items similarly */}
          </ul>
        </nav>
      </div>
      <div className="content">
        {selectedSubMenuItem && renderSubMenu()}
      </div>
    </div>
  );
};

export default PreKWorksheets;
