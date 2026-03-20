import React from 'react';
import UniversalSubjectHub from '../assessments/UniversalSubjectHub';

export default function GrammarHub() {
    return (
        <UniversalSubjectHub
            title="Grammar & Language"
            subtitle="Master the rules of reading and writing 📝"
            subjectKeywords={['GRAMMAR', 'ENGLISH', 'LANGUAGE', 'LITERATURE', 'COMPREHENSION']}
            primaryColor="#3b82f6" 
            secondaryColor="#1d4ed8"
            icon="📚"
            ambientSymbols={['A', 'B', 'C', '📝', '✍️', '📖', '🗣️']}
        />
    );
}