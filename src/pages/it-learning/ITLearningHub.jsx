import React from 'react';
import UniversalSubjectHub from '../assessments/UniversalSubjectHub';

export default function ITLearningHub() {
    const videoCategories = [
        {
            id: 'elementary', title: 'Elementary (Grades 1-5)', icon: '🎮', color: '#10b981',
            playlists: [
                { title: 'Code.org - Hour of Code', channel: 'Code.org', description: 'Fun coding tutorials for beginners.', thumbnail: '🎯', url: 'https://www.youtube.com/@codeorg/playlists', topics: ['Block Coding', 'Scratch'] },
                { title: 'Scratch Programming', channel: 'Scratch Team', description: 'Create games and animations.', thumbnail: '🐱', url: 'https://www.youtube.com/@scratch/videos', topics: ['Scratch', 'Animation'] }
            ]
        },
        {
            id: 'middle', title: 'Middle School (Grades 6-8)', icon: '🚀', color: '#6366f1',
            playlists: [
                { title: 'Python for Beginners', channel: 'Programming with Mosh', description: 'Learn Python programming.', thumbnail: '🐍', url: 'https://www.youtube.com/@programmingwithmosh/playlists', topics: ['Python', 'Functions'] },
                { title: 'Web Development Basics', channel: 'freeCodeCamp.org', description: 'HTML, CSS, and JS fundamentals.', thumbnail: '🌐', url: 'https://www.youtube.com/@freecodecamp/playlists', topics: ['HTML', 'CSS', 'JS'] }
            ]
        },
        {
            id: 'high', title: 'High School (Grades 9-12)', icon: '🎓', color: '#8b5cf6',
            playlists: [
                { title: 'Java Programming Complete', channel: 'Telusko', description: 'Master Java with OOP concepts.', thumbnail: '☕', url: 'https://www.youtube.com/@Telusko/playlists', topics: ['Java', 'OOP'] },
                { title: 'Cybersecurity Basics', channel: 'NetworkChuck', description: 'Learn ethical hacking and networks.', thumbnail: '🔒', url: 'https://www.youtube.com/@NetworkChuck/playlists', topics: ['Security', 'Networking'] }
            ]
        }
    ];

    return (
        <UniversalSubjectHub
            title="IT & Computer Science"
            subtitle="Code the future and build technology 💻"
            subjectKeywords={['COMPUTER', 'IT', 'PROGRAMMING', 'CODING', 'ROBOTICS', 'AI', 'DATA', 'CYBER', 'JAVA', 'PYTHON', 'SOFTWARE', 'TECHNOLOGY', 'SQL', 'WEB']}
            primaryColor="#8b5cf6" 
            secondaryColor="#6d28d9"
            icon="💻"
            ambientSymbols={['{ }', '< >', '01', '⌨️', '🌐', '🤖', '💾']}
            videoCategories={videoCategories}
        />
    );
}