import React, { useState } from 'react';
import '../../css/StoryGenerator.css';

const StoryGenerator = ({ audioEnabled = true }) => {
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedSetting, setSelectedSetting] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [showStory, setShowStory] = useState(false);

  const characters = [
    { id: 'dragon', name: 'Friendly Dragon', emoji: '🐉' },
    { id: 'unicorn', name: 'Magic Unicorn', emoji: '🦄' },
    { id: 'robot', name: 'Clever Robot', emoji: '🤖' },
    { id: 'astronaut', name: 'Space Explorer', emoji: '👨‍🚀' },
    { id: 'dinosaur', name: 'Baby Dinosaur', emoji: '🦕' },
    { id: 'superhero', name: 'Young Superhero', emoji: '🦸' }
  ];

  const settings = [
    { id: 'castle', name: 'Magic Castle', emoji: '🏰' },
    { id: 'forest', name: 'Enchanted Forest', emoji: '🌲' },
    { id: 'ocean', name: 'Deep Ocean', emoji: '🌊' },
    { id: 'space', name: 'Outer Space', emoji: '🚀' },
    { id: 'school', name: 'Fun School', emoji: '🏫' },
    { id: 'jungle', name: 'Wild Jungle', emoji: '🌴' }
  ];

  const themes = [
    { id: 'friendship', name: 'Making Friends', emoji: '🤝' },
    { id: 'adventure', name: 'Big Adventure', emoji: '⚡' },
    { id: 'learning', name: 'Learning New Things', emoji: '📚' },
    { id: 'helping', name: 'Helping Others', emoji: '💝' },
    { id: 'discovery', name: 'Amazing Discovery', emoji: '🔍' },
    { id: 'courage', name: 'Being Brave', emoji: '💪' }
  ];

  const storyTemplates = {
    dragon: {
      castle: {
        friendship: "Once upon a time, there was a friendly dragon named Sparky who lived in a magnificent magic castle. One day, Sparky felt lonely and decided to make new friends. Sparky flew around the castle towers and met a shy little bird. They played hide-and-seek among the clouds and shared stories. By sunset, they had become the best of friends, and Sparky learned that true friendship makes even the biggest castle feel like home!",
        adventure: "In a towering magic castle lived Sparky, a brave dragon with shimmering scales. One morning, Sparky discovered a mysterious map leading to the Crystal Caverns beneath the castle. With courage in heart, Sparky ventured through secret passages, solved ancient riddles, and found a treasure chest filled with magical crystals that lit up the entire castle!",
        learning: "Sparky the dragon lived in a wonderful castle filled with books and magic. Every day, Sparky would read about new things - from counting stars to brewing potions. One day, the castle's wise owl taught Sparky about kindness and sharing. Sparky learned that the greatest magic of all comes from being kind to others!",
        helping: "In the magic castle, Sparky the dragon noticed that the castle's garden flowers were wilting. Using dragon fire carefully, Sparky warmed the cold soil and brought buckets of water from the moat. Soon, the flowers bloomed beautifully, and all the castle creatures thanked Sparky for the helpful deed!",
        discovery: "While exploring the magic castle's library, Sparky the dragon stumbled upon a dusty old book that glowed with magic light. Inside, Sparky discovered spells for making rainbows and flying faster! Excited by this discovery, Sparky practiced every day and became the most magical dragon in the kingdom!",
        courage: "When a storm threatened the magic castle, little Sparky the dragon felt scared. But remembering all the brave dragons from storybooks, Sparky took a deep breath and used dragon fire to light torches throughout the castle, keeping everyone safe and warm until the storm passed. Sparky learned that being brave means doing the right thing even when you're scared!"
      },
      forest: {
        friendship: "Sparky the friendly dragon lived near an enchanted forest. One day, Sparky met a family of woodland creatures who were afraid of dragons. But Sparky showed them kindness by helping find their lost acorns and protecting them from rain with dragon wings. Soon, they all became wonderful friends!",
        adventure: "Deep in the enchanted forest, Sparky the dragon heard tales of a mystical waterfall that granted wishes. Braving thorny paths and crossing wobbly bridges, Sparky journeyed through the forest, made friends with talking trees, and finally found the magical waterfall, where Sparky wished for everyone to be happy!",
        learning: "In the enchanted forest, Sparky the dragon discovered a school for forest animals. Curious and eager to learn, Sparky joined their classes about nature, seasons, and forest life. Sparky taught them about dragons while learning about the forest, proving that everyone can be both a teacher and a student!",
        helping: "When Sparky the dragon noticed the enchanted forest's river was drying up, our hero sprang into action! Using powerful wings, Sparky flew to distant mountains, brought back ice blocks, and melted them carefully to refill the river. All the forest creatures celebrated Sparky's kindness!",
        discovery: "While flying over the enchanted forest, Sparky the dragon spotted something shimmering below the trees. Landing to investigate, Sparky found a grove of singing flowers that made beautiful music! Sparky spent the day learning their melodies and sharing them with friends throughout the forest!",
        courage: "When a fierce storm struck the enchanted forest, many small animals were scared and lost. Sparky the dragon, though young and a little frightened too, guided them to safety in a cozy cave, kept them warm with gentle dragon fire, and told funny stories until the storm passed. Everyone cheered for brave Sparky!"
      }
    },
    unicorn: {
      castle: {
        friendship: "In a sparkling magic castle lived Starlight, a beautiful unicorn with a rainbow mane. Starlight loved making friends! One day, a new family moved into the castle, and their shy daughter felt lonely. Starlight trotted over, offered a magical ride through the castle gardens, and they became instant best friends, playing together every day!",
        adventure: "Starlight the unicorn lived in a grand magic castle where magic happened every day. When the castle's magic crystals started dimming, Starlight embarked on an epic quest through secret chambers and hidden passages, solving puzzles and collecting stardust until the castle sparkled brighter than ever!",
        learning: "Every morning, Starlight the unicorn attended the magic castle's grand library to learn new spells and read wonderful books. From learning about the stars to understanding feelings, Starlight discovered that knowledge is the most powerful magic of all!",
        helping: "When Starlight the unicorn noticed the castle's garden butterflies couldn't find flowers, our magical friend used unicorn magic to grow the most beautiful flower garden ever! The grateful butterflies danced around Starlight, creating rainbows with their wings!",
        discovery: "Exploring the magic castle's tallest tower, Starlight the unicorn found an ancient telescope that could see into dreams! Through it, Starlight discovered that everyone's dreams were connected by streams of starlight, creating a beautiful web of wishes across the sky!",
        courage: "When the magic castle's bridge broke during a storm, Starlight the unicorn was scared of heights but knew others needed help. Taking a brave breath, Starlight used magic horn power to create a temporary rainbow bridge, helping everyone cross safely. Starlight learned that courage means helping others even when you're afraid!"
      }
    },
    robot: {
      space: {
        friendship: "In a space station orbiting distant stars, Beep-Boop the clever robot felt lonely among the machines. One day, an alien spacecraft landed, and out came a friendly alien child. Though they couldn't speak each other's languages at first, they used drawings and music to communicate, becoming the best intergalactic friends!",
        adventure: "Beep-Boop the robot detected strange signals from an unexplored asteroid. Boarding a space shuttle, our brave robot explorer journeyed through meteor showers and discovered an ancient alien civilization! Beep-Boop learned their language, made new friends, and brought back amazing knowledge to share!",
        learning: "In the educational module of the space station, Beep-Boop the robot studied everything from quantum physics to art history. Every night, Beep-Boop would stargaze and wonder about the universe, learning that curiosity is the fuel for adventure!",
        helping: "When the space station's life support system malfunctioned, Beep-Boop the robot quickly analyzed the problem, used robotic tools to fix broken circuits, and saved everyone aboard! The crew celebrated Beep-Boop's quick thinking and helpful nature!",
        discovery: "While scanning deep space, Beep-Boop the robot discovered a new constellation that looked exactly like a smiling face! This discovery brought joy to everyone on the space station, reminding them that even in the vastness of space, happiness can be found everywhere!",
        courage: "During a solar storm, Beep-Boop the robot had to venture outside the space station to repair critical antennas. Though the task was dangerous and scary, Beep-Boop remembered that bravery means doing what's right even when circuits are scared. Mission accomplished!"
      }
    }
  };

  const generateStory = () => {
    if (!selectedCharacter || !selectedSetting || !selectedTheme) {
      if (audioEnabled) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance('Please select a character, setting, and theme first!');
        synth.speak(utterance);
      }
      return;
    }

    // Generate story based on selections
    let story = '';

    if (storyTemplates[selectedCharacter] &&
        storyTemplates[selectedCharacter][selectedSetting] &&
        storyTemplates[selectedCharacter][selectedSetting][selectedTheme]) {
      story = storyTemplates[selectedCharacter][selectedSetting][selectedTheme];
    } else {
      // Fallback generic story
      const charObj = characters.find(c => c.id === selectedCharacter);
      const setObj = settings.find(s => s.id === selectedSetting);
      const themeObj = themes.find(t => t.id === selectedTheme);

      story = `Once upon a time, there was a ${charObj.name} who lived near a ${setObj.name}. Every day was an adventure about ${themeObj.name}. One special day, our hero discovered something amazing and learned that kindness, courage, and friendship make every story magical! The End.`;
    }

    setGeneratedStory(story);
    setShowStory(true);

    // Read the story aloud
    if (audioEnabled) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.rate = 0.85;
      synth.speak(utterance);
    }
  };

  const resetStory = () => {
    setSelectedCharacter('');
    setSelectedSetting('');
    setSelectedTheme('');
    setGeneratedStory('');
    setShowStory(false);
    if (audioEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="story-generator-container">
      <div className="story-generator-header">
        <h2>📖 AI Story Generator</h2>
        <p>Create your own magical story!</p>
      </div>

      {!showStory ? (
        <div className="story-builder">
          <div className="selection-section">
            <h3>1. Choose Your Character:</h3>
            <div className="options-grid">
              {characters.map((char) => (
                <button
                  key={char.id}
                  className={`option-card ${selectedCharacter === char.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCharacter(char.id)}
                >
                  <span className="option-emoji">{char.emoji}</span>
                  <span className="option-name">{char.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="selection-section">
            <h3>2. Choose Your Setting:</h3>
            <div className="options-grid">
              {settings.map((setting) => (
                <button
                  key={setting.id}
                  className={`option-card ${selectedSetting === setting.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSetting(setting.id)}
                >
                  <span className="option-emoji">{setting.emoji}</span>
                  <span className="option-name">{setting.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="selection-section">
            <h3>3. Choose Your Theme:</h3>
            <div className="options-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`option-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <span className="option-emoji">{theme.emoji}</span>
                  <span className="option-name">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="generate-button"
              onClick={generateStory}
              disabled={!selectedCharacter || !selectedSetting || !selectedTheme}
            >
              ✨ Generate My Story!
            </button>
          </div>
        </div>
      ) : (
        <div className="story-display">
          <div className="story-content">
            <h3>Your Magical Story:</h3>
            <div className="story-text">
              {generatedStory}
            </div>
          </div>
          <div className="story-actions">
            <button className="action-btn read-again" onClick={() => {
              if (audioEnabled) {
                const synth = window.speechSynthesis;
                synth.cancel();
                const utterance = new SpeechSynthesisUtterance(generatedStory);
                utterance.rate = 0.85;
                synth.speak(utterance);
              }
            }}>
              🔊 Read Again
            </button>
            <button className="action-btn new-story" onClick={resetStory}>
              📝 Create New Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
