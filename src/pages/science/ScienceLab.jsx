import React from 'react';
import UniversalSubjectHub from '../assessments/UniversalSubjectHub';

export default function ScienceLab() {
    const videoCategories = [
        {
            id: 'science-fun', title: 'Science Adventures', icon: '🌍', color: '#10b981',
            playlists: [
                { title: 'Crash Course Kids', channel: 'Crash Course', description: 'Science isn\'t just for grown-ups!', thumbnail: '🔬', url: 'https://www.youtube.com/user/crashcoursekids', topics: ['Earth', 'Space', 'Biology'] },
                { title: 'SciShow Space', channel: 'SciShow', description: 'Explore the universe with experts.', thumbnail: '🚀', url: 'https://www.youtube.com/user/scishowspace', topics: ['Astronomy', 'Physics'] }
            ]
        }
    ];

    return (
        <UniversalSubjectHub
            title="Science Lab"
            subtitle="Discover the wonders of the universe 🔬"
            subjectKeywords={['SCIENCE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'ZOOLOGY', 'BOTANY', 'ASTRONOMY', 'ENVIRONMENTAL']}
            primaryColor="#10b981" 
            secondaryColor="#059669"
            icon="🔬"
            ambientSymbols={['🔬', '🧬', '⚛️', '🔭', '🧪', '🪐', '🌡️']}
            videoCategories={videoCategories}
        />
    );
}