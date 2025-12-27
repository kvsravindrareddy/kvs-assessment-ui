import React, { useState } from 'react';
import '../../css/RhymeFinder.css';

const RhymeFinder = ({ audioEnabled = true }) => {
  const [inputWord, setInputWord] = useState('');
  const [rhymes, setRhymes] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Comprehensive rhyme database
  const rhymeDatabase = {
    cat: ['bat', 'hat', 'mat', 'rat', 'sat', 'flat', 'chat'],
    dog: ['log', 'frog', 'jog', 'fog', 'hog', 'blog'],
    ball: ['call', 'fall', 'hall', 'mall', 'tall', 'wall', 'small'],
    sun: ['fun', 'run', 'bun', 'done', 'one', 'ton', 'won'],
    tree: ['bee', 'free', 'sea', 'tea', 'three', 'knee', 'see'],
    blue: ['true', 'clue', 'flew', 'glue', 'new', 'shoe', 'two', 'zoo'],
    play: ['day', 'say', 'way', 'may', 'stay', 'pay', 'hay', 'ray'],
    book: ['look', 'cook', 'took', 'hook', 'shook', 'brook'],
    car: ['far', 'star', 'bar', 'jar', 'tar', 'guitar'],
    moon: ['soon', 'noon', 'tune', 'june', 'spoon', 'balloon'],
    house: ['mouse', 'blouse'],
    rain: ['train', 'brain', 'chain', 'main', 'pain', 'gain', 'plane'],
    sing: ['ring', 'wing', 'king', 'bring', 'spring', 'thing', 'sting'],
    light: ['bright', 'night', 'right', 'sight', 'fight', 'kite', 'white'],
    red: ['bed', 'fed', 'led', 'said', 'bread', 'head', 'read'],
    green: ['seen', 'bean', 'clean', 'mean', 'queen', 'screen'],
    boy: ['joy', 'toy', 'enjoy'],
    girl: ['curl', 'pearl', 'swirl', 'twirl'],
    fish: ['wish', 'dish', 'swish'],
    star: ['far', 'car', 'bar', 'jar', 'tar'],
    snow: ['go', 'no', 'flow', 'glow', 'grow', 'show', 'slow', 'throw'],
    hop: ['stop', 'top', 'shop', 'drop', 'pop'],
    jump: ['bump', 'lump', 'pump', 'stump', 'thump'],
    sleep: ['deep', 'keep', 'sheep', 'steep', 'weep'],
    smile: ['while', 'mile', 'file', 'style', 'tile'],
    bear: ['care', 'dare', 'fair', 'hair', 'pair', 'share', 'square', 'wear'],
    bird: ['word', 'heard'],
    dream: ['cream', 'stream', 'team', 'beam', 'steam'],
    grow: ['go', 'no', 'flow', 'glow', 'show', 'slow', 'snow', 'throw'],
    love: ['dove', 'glove', 'above'],
    heart: ['art', 'cart', 'part', 'smart', 'start'],
    kind: ['find', 'mind', 'blind', 'behind', 'wind'],
    friend: ['end', 'bend', 'send', 'spend', 'trend'],
    happy: ['snappy'],
    learn: ['turn', 'burn', 'earn'],
    read: ['feed', 'need', 'seed', 'speed', 'weed', 'lead', 'bead'],
    write: ['bite', 'kite', 'sight', 'fight', 'light', 'night', 'right', 'white'],
    count: ['amount', 'mount'],
    add: ['bad', 'dad', 'glad', 'mad', 'sad', 'had'],
    think: ['blink', 'drink', 'link', 'pink', 'sink', 'wink']
  };

  const exampleSentences = {
    cat: 'The cat wore a hat',
    bat: 'A bat can chat',
    dog: 'The dog jumped over a log',
    fun: 'We had fun in the sun',
    tree: 'A bee flew to the tree',
    blue: 'The sky is blue and so is the glue',
    play: 'Let\'s play every day',
    moon: 'We\'ll see the moon soon'
  };

  const findRhymes = () => {
    const word = inputWord.toLowerCase().trim();

    if (!word) {
      if (audioEnabled) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance('Please enter a word first!');
        synth.speak(utterance);
      }
      return;
    }

    let foundRhymes = [];

    if (rhymeDatabase[word]) {
      foundRhymes = rhymeDatabase[word];
    } else {
      // Try to find rhymes by matching ending sounds
      const wordEnding = word.slice(-2);
      Object.keys(rhymeDatabase).forEach(key => {
        if (key.slice(-2) === wordEnding && key !== word) {
          foundRhymes = [...foundRhymes, key, ...rhymeDatabase[key]];
        }
      });

      // Remove duplicates
      foundRhymes = [...new Set(foundRhymes)];
    }

    if (foundRhymes.length === 0) {
      foundRhymes = ['No rhymes found! Try words like: cat, dog, sun, tree, play'];
    }

    setRhymes(foundRhymes);
    setShowResults(true);

    if (audioEnabled) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const message = foundRhymes.length > 0 ?
        `I found ${foundRhymes.length} words that rhyme with ${word}!` :
        'No rhymes found';
      const utterance = new SpeechSynthesisUtterance(message);
      synth.speak(utterance);
    }
  };

  const speakWord = (word) => {
    if (audioEnabled) {
      const synth = window.speechSynthesis;
      synth.cancel();

      const example = exampleSentences[word] || `The word is ${word}`;
      const utterance = new SpeechSynthesisUtterance(example);
      utterance.rate = 0.8;
      synth.speak(utterance);
    }
  };

  const reset = () => {
    setInputWord('');
    setRhymes([]);
    setShowResults(false);
    if (audioEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="rhyme-finder-container">
      <div className="rhyme-finder-header">
        <h2>🎵 AI Rhyme Finder</h2>
        <p>Find words that rhyme!</p>
      </div>

      <div className="rhyme-finder-card">
        <div className="input-section">
          <label htmlFor="word-input">Enter a word:</label>
          <div className="input-group">
            <input
              id="word-input"
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && findRhymes()}
              placeholder="Try: cat, dog, sun, tree..."
              className="word-input"
            />
            <button className="find-button" onClick={findRhymes}>
              🔍 Find Rhymes
            </button>
          </div>
        </div>

        {showResults && (
          <div className="results-section">
            <h3>Words that rhyme with "{inputWord}":</h3>
            <div className="rhymes-grid">
              {rhymes.map((rhyme, index) => (
                <div
                  key={index}
                  className="rhyme-card"
                  onClick={() => speakWord(rhyme)}
                >
                  <span className="rhyme-word">{rhyme}</span>
                  <span className="speaker-icon">🔊</span>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button className="reset-button" onClick={reset}>
                🔄 Try Another Word
              </button>
            </div>
          </div>
        )}

        {!showResults && (
          <div className="suggestions">
            <p>💡 Try these popular words:</p>
            <div className="suggestion-chips">
              {['cat', 'dog', 'sun', 'tree', 'play', 'moon', 'sing', 'star'].map((word) => (
                <button
                  key={word}
                  className="suggestion-chip"
                  onClick={() => {
                    setInputWord(word);
                    setTimeout(findRhymes, 100);
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RhymeFinder;
