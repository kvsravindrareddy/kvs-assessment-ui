// GenerateNumbers.js
import React, { useState } from 'react';
import axios from 'axios';
import '../../css/styles.css';

const GenerateNumbers = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [complexity, setComplexity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const numbersPerPage = 100;
  const cellsPerRow = 10;
  const rowsPerPage = 10;

  const handleGenerateNumbers = async () => {
    try {
      const response = await axios.get(`http://localhost:9004/generate/numbers`, {
        params: {
          userId,
          email,
          type,
          complexity,
          from: complexity === 'CUSTOM' ? from : undefined,
          to: complexity === 'CUSTOM' ? to : undefined
        }
      });
        console.log("Response"+response.data.numbers);
        setGeneratedNumbers(response.data.numbers);
        setCurrentPage(1);
    } catch (error) {
      console.error('Error generating numbers:', error);
      setGeneratedNumbers([]);
    }
  };

  // Calculate current numbers and rows
  const indexOfLastNumber = currentPage * numbersPerPage;
  const indexOfFirstNumber = indexOfLastNumber - numbersPerPage;
  const currentNumbers = generatedNumbers.slice(indexOfFirstNumber, indexOfLastNumber);
  const rows = [];
  for (let i = 0; i < currentNumbers.length; i += cellsPerRow) {
    rows.push(currentNumbers.slice(i, i + cellsPerRow));
  }

    // Pagination logic
  const totalPageNumbers = Math.ceil(generatedNumbers.length / numbersPerPage);
  const displayPages = 3; // Number of pages to display
  const startPage = Math.max(1, currentPage - Math.floor(displayPages / 2));
  const endPage = Math.min(totalPageNumbers, startPage + displayPages - 1);

  const nextPage = () => {
    if (currentPage < totalPageNumbers) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPageNumbers);
  };

  //Logic for displaying numbers for the current page
  return (
    <div className='generateNumbersMainDiv'>
      <table className='generateNumberQuesTb'>
        <thead>
            <tr><b>Generate Numbers</b></tr>
        </thead>
        <tbody>
          <tr>
            <td>User ID</td>
            <td><input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Email</td>
            <td><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Type</td>
            <td>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Select Type</option>
                <option value="EVEN">Even</option>
                <option value="ODD">Odd</option>
                <option value="PRIME">Prime</option>
                <option value="COMPOSITE">Composite</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
                <option value="FIBONACCI">Fibonacci</option>
                <option value="PERFECT">Perfect</option>
                <option value="ABUNDANT">Abundant</option>
                <option value="DEFICIENT">Deficient</option>
                <option value="PALINDROME">Palindrome</option>
                <option value="ARMSTRONG">Armstrong</option>
                <option value="RANDOM">Random</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Complexity</td>
            <td>
              <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
                <option value="">Select Complexity</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="EXTREME">Extreme</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </td>
          </tr>
          {complexity === 'CUSTOM' && (
            <tr>
              <td>From:</td>
              <td><input type="number" value={from} onChange={(e) => setFrom(e.target.value)} /></td>
              <td>To:</td>
              <td><input type="number" value={to} onChange={(e) => setTo(e.target.value)} /></td>
            </tr>
          )}
          <tr>
            <td colSpan="2">
              <button onClick={handleGenerateNumbers}>Generate Numbers</button>
            </td>
          </tr>
        </tbody>
      </table>
      {generatedNumbers.length > 0 && (
        <div>
          <h3>Generated {type} Numbers</h3>
          <table className="generated-numbers-table">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((number, cellIndex) => (
                    <td key={cellIndex}>{number}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="pagination">
            <button onClick={firstPage}>««</button>
            <button onClick={prevPage}>«</button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((number) => (
              <button key={number} onClick={() => setCurrentPage(number)}>{number}</button>
            ))}
            <button onClick={nextPage}>»</button>
            <button onClick={lastPage}>»»</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateNumbers;
