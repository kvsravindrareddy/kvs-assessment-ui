import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ITLearningHub.css';

export default function ITLearningHub() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'assessments'

    // Curated YouTube channels and playlists for different grades
    const videoCategories = [
        {
            id: 'elementary',
            title: 'Elementary (Grades 1-5)',
            icon: '🎮',
            color: '#10b981',
            playlists: [
                {
                    title: 'Code.org - Hour of Code',
                    channel: 'Code.org',
                    description: 'Fun coding tutorials for beginners using block-based programming',
                    thumbnail: '🎯',
                    url: 'https://www.youtube.com/@codeorg/playlists',
                    topics: ['Block Coding', 'Scratch', 'Game Design']
                },
                {
                    title: 'Scratch Programming Tutorials',
                    channel: 'Scratch Team',
                    description: 'Learn to create games and animations with Scratch',
                    thumbnail: '🐱',
                    url: 'https://www.youtube.com/@scratch/videos',
                    topics: ['Scratch', 'Animation', 'Games']
                },
                {
                    title: 'Computer Basics for Kids',
                    channel: 'Tynker',
                    description: 'Understanding computers, keyboards, mouse, and basic operations',
                    thumbnail: '💻',
                    url: 'https://www.youtube.com/@Tynker/playlists',
                    topics: ['Computer Basics', 'Typing', 'Digital Literacy']
                }
            ]
        },
        {
            id: 'middle-school',
            title: 'Middle School (Grades 6-8)',
            icon: '🚀',
            color: '#6366f1',
            playlists: [
                {
                    title: 'Python for Beginners',
                    channel: 'Programming with Mosh',
                    description: 'Learn Python programming from scratch with hands-on projects',
                    thumbnail: '🐍',
                    url: 'https://www.youtube.com/@programmingwithmosh/playlists',
                    topics: ['Python', 'Variables', 'Functions', 'Loops']
                },
                {
                    title: 'Web Development Basics',
                    channel: 'freeCodeCamp.org',
                    description: 'HTML, CSS, and JavaScript fundamentals for building websites',
                    thumbnail: '🌐',
                    url: 'https://www.youtube.com/@freecodecamp/playlists',
                    topics: ['HTML', 'CSS', 'JavaScript', 'Web Design']
                },
                {
                    title: 'App Inventor Tutorials',
                    channel: 'MIT App Inventor',
                    description: 'Build mobile apps with drag-and-drop coding',
                    thumbnail: '📱',
                    url: 'https://www.youtube.com/@MITAppInventor/playlists',
                    topics: ['Mobile Apps', 'Android', 'Block Coding']
                }
            ]
        },
        {
            id: 'high-school',
            title: 'High School (Grades 9-12)',
            icon: '🎓',
            color: '#8b5cf6',
            playlists: [
                {
                    title: 'Java Programming Complete Course',
                    channel: 'Telusko',
                    description: 'Master Java with object-oriented programming concepts',
                    thumbnail: '☕',
                    url: 'https://www.youtube.com/@Telusko/playlists',
                    topics: ['Java', 'OOP', 'Data Structures', 'Algorithms']
                },
                {
                    title: 'Web Development Full Course',
                    channel: 'Traversy Media',
                    description: 'Build real-world websites with React, Node.js, and databases',
                    thumbnail: '⚛️',
                    url: 'https://www.youtube.com/@TraversyMedia/playlists',
                    topics: ['React', 'Node.js', 'MongoDB', 'Full Stack']
                },
                {
                    title: 'Computer Science Fundamentals',
                    channel: 'CS Dojo',
                    description: 'Data structures, algorithms, and problem-solving techniques',
                    thumbnail: '🧮',
                    url: 'https://www.youtube.com/@CSDojo/playlists',
                    topics: ['Algorithms', 'Data Structures', 'Problem Solving']
                },
                {
                    title: 'Cybersecurity Basics',
                    channel: 'NetworkChuck',
                    description: 'Learn ethical hacking, network security, and data protection',
                    thumbnail: '🔒',
                    url: 'https://www.youtube.com/@NetworkChuck/playlists',
                    topics: ['Security', 'Ethical Hacking', 'Networks']
                }
            ]
        }
    ];

    // IT Assessment categories by grade level
    const assessmentCategories = [
        {
            id: 'computer-basics',
            title: 'Computer Basics',
            description: 'Hardware, software, operating systems, and digital literacy',
            icon: '💻',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            grades: ['I', 'II', 'III', 'IV', 'V', 'VI'],
            topics: ['Hardware', 'Software', 'OS Basics', 'File Management']
        },
        {
            id: 'typing-skills',
            title: 'Typing & Keyboard Skills',
            description: 'Touch typing, keyboard shortcuts, and productivity tools',
            icon: '⌨️',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            grades: ['III', 'IV', 'V', 'VI', 'VII'],
            topics: ['Touch Typing', 'Shortcuts', 'Word Processing']
        },
        {
            id: 'scratch-coding',
            title: 'Block Coding (Scratch)',
            description: 'Visual programming with Scratch and block-based tools',
            icon: '🎮',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            grades: ['III', 'IV', 'V', 'VI'],
            topics: ['Scratch', 'Loops', 'Events', 'Game Design']
        },
        {
            id: 'python-fundamentals',
            title: 'Python Programming',
            description: 'Variables, loops, functions, and Python basics',
            icon: '🐍',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            grades: ['VI', 'VII', 'VIII', 'IX', 'X'],
            topics: ['Variables', 'Data Types', 'Functions', 'Loops']
        },
        {
            id: 'web-development',
            title: 'Web Development',
            description: 'HTML, CSS, JavaScript, and website creation',
            icon: '🌐',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            grades: ['VII', 'VIII', 'IX', 'X'],
            topics: ['HTML', 'CSS', 'JavaScript', 'Responsive Design']
        },
        {
            id: 'java-programming',
            title: 'Java & OOP Concepts',
            description: 'Object-oriented programming with Java',
            icon: '☕',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            grades: ['IX', 'X'],
            topics: ['Classes', 'Objects', 'Inheritance', 'Polymorphism']
        },
        {
            id: 'data-structures',
            title: 'Data Structures',
            description: 'Arrays, linked lists, stacks, queues, trees, and graphs',
            icon: '🗂️',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            grades: ['IX', 'X'],
            topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs']
        },
        {
            id: 'databases',
            title: 'Database & SQL',
            description: 'Database concepts, SQL queries, and data management',
            icon: '🗄️',
            gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            grades: ['IX', 'X'],
            topics: ['SQL', 'Tables', 'Queries', 'Normalization']
        },
        {
            id: 'cybersecurity',
            title: 'Cybersecurity Basics',
            description: 'Online safety, passwords, encryption, and security awareness',
            icon: '🔒',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            grades: ['VII', 'VIII', 'IX', 'X'],
            topics: ['Security', 'Encryption', 'Privacy', 'Safe Browsing']
        }
    ];

    const handleVideoClick = (url) => {
        window.open(url, '_blank');
    };

    const handleAssessmentClick = (category) => {
        // Navigate to IT assessment with category pre-selected
        navigate('/assessments/subject-assessments', {
            state: { subject: 'IT', category: category.id }
        });
    };

    return (
        <div className="it-learning-hub-container">
            {/* Header */}
            <div className="it-hub-header">
                <button className="it-back-btn" onClick={() => navigate('/assessments')}>
                    ← Back
                </button>
                <div className="it-header-content">
                    <h1>💻 IT Learning Hub</h1>
                    <p>Master computer science, programming, and digital skills through videos and practice assessments</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="it-tab-navigation">
                <button
                    className={`it-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('videos')}
                >
                    📺 Video Tutorials
                </button>
                <button
                    className={`it-tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assessments')}
                >
                    📝 Practice Assessments
                </button>
            </div>

            {/* Videos Tab */}
            {activeTab === 'videos' && (
                <div className="it-content-section">
                    <div className="it-section-intro">
                        <h2>🎥 Curated Video Playlists</h2>
                        <p>Learn from the best YouTube channels and educational creators</p>
                    </div>

                    {videoCategories.map(category => (
                        <div key={category.id} className="it-video-category">
                            <div className="it-category-header" style={{ borderLeftColor: category.color }}>
                                <span className="it-category-icon">{category.icon}</span>
                                <h3>{category.title}</h3>
                            </div>
                            <div className="it-playlists-grid">
                                {category.playlists.map((playlist, idx) => (
                                    <div
                                        key={idx}
                                        className="it-playlist-card"
                                        onClick={() => handleVideoClick(playlist.url)}
                                    >
                                        <div className="it-playlist-thumbnail">
                                            <span className="it-playlist-emoji">{playlist.thumbnail}</span>
                                        </div>
                                        <div className="it-playlist-content">
                                            <h4>{playlist.title}</h4>
                                            <p className="it-playlist-channel">📺 {playlist.channel}</p>
                                            <p className="it-playlist-description">{playlist.description}</p>
                                            <div className="it-playlist-topics">
                                                {playlist.topics.map((topic, i) => (
                                                    <span key={i} className="it-topic-tag">{topic}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="it-playlist-action">
                                            <span className="it-watch-btn">Watch Now →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assessments Tab */}
            {activeTab === 'assessments' && (
                <div className="it-content-section">
                    <div className="it-section-intro">
                        <h2>📝 IT Practice Assessments</h2>
                        <p>Test your knowledge with grade-appropriate IT assessments</p>
                    </div>

                    <div className="it-assessments-grid">
                        {assessmentCategories.map(category => (
                            <div
                                key={category.id}
                                className="it-assessment-card"
                                onClick={() => handleAssessmentClick(category)}
                            >
                                <div className="it-assessment-icon" style={{ background: category.gradient }}>
                                    {category.icon}
                                </div>
                                <div className="it-assessment-content">
                                    <h3>{category.title}</h3>
                                    <p>{category.description}</p>
                                    <div className="it-assessment-grades">
                                        <span className="it-grades-label">📚 Grades:</span>
                                        <span className="it-grades-list">{category.grades.join(', ')}</span>
                                    </div>
                                    <div className="it-assessment-topics">
                                        {category.topics.map((topic, i) => (
                                            <span key={i} className="it-assessment-topic-tag">{topic}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="it-assessment-action" style={{ background: category.gradient }}>
                                    <span>Start Test →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
