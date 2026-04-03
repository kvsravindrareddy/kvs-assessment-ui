import React from 'react';
import SpecialtyAssessmentHub from '../assessments/SpecialtyAssessmentHub';

export default function VocabularyHub() {
    return (
        <SpecialtyAssessmentHub
            title="Vocabulary Matrix"
            subtitle="Expand your word power and spelling confidence 🔤"
            topics={[
                { id: 'SPELLING', label: 'Spelling Data', icon: '📝' },
                { id: 'SYNONYMS', label: 'Synonym Link', icon: '🔄' },
                { id: 'ANTONYMS', label: 'Antonym Void', icon: '↔️' },
                { id: 'SIGHT_WORDS', label: 'Sight Words', icon: '👁️' }
            ]}
            primaryColor="#f43f5e" 
            secondaryColor="#be123c"
            icon="🔠"
            ambientSymbols={['A', 'Z', '📖', '⭐', '✨', '🧠', '🧩']}
        />
    );
}