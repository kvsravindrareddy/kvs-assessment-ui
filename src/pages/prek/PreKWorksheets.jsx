import React, { useState } from 'react';
import AlphabetGenerator from './AlphabetGenerator'; // Import your AlphabetGenerator component
import LearningLetters from './LearningLetters'; // Import other components similarly
import TracingLetters from './TracingLetters';
import PrintingLetters from './PrintingLetters';
// Import other components similarly

const PreKWorksheets = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const handleClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
  };

  const renderSubMenu = () => {
    switch (selectedMenuItem) {
      case 'Alphabets':
        return (
          <div>
            <AlphabetGenerator />
            {/* Render other sub-components under Alphabets */}
          </div>
        );
      case 'Sounds / Phonics':
        return <LearningLetters />;
      case 'Words / Vocabulary':
        return <TracingLetters />;
      // Add other cases for each submenu item
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
              <a href="#" onClick={() => handleClick('Alphabets')}>Alphabets</a>
              {/* Add other menu items with onClick event handlers */}
            </li>
            <li className="menu-item menu-item--collapsed">
              <a href="#" onClick={() => handleClick('Sounds / Phonics')}>Sounds / Phonics</a>
            </li>
            {/* Add other menu items similarly */}
          </ul>
        </nav>
      </div>
      <div className="content">
        {selectedMenuItem && renderSubMenu()}
      </div>
    </div>
  );
};

export default PreKWorksheets;
