import React from 'react';
import UniversalSubjectHub from '../assessments/UniversalSubjectHub';

export default function VocabularyHub() {
    return (
        <UniversalSubjectHub
            title="Vocabulary & Spelling"
            subtitle="Expand your word power and confidence 🔤"
            subjectKeywords={['VOCABULARY', 'SPELLING', 'PHONICS', 'WORDS', 'DICTIONARY']}
            primaryColor="#f43f5e" 
            secondaryColor="#be123c"
            icon="🔤"
            ambientSymbols={['A', 'Z', '📖', '⭐', '✨', '🧠', '🧩']}
        />
    );
}