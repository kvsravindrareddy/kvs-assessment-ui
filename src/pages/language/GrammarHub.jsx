import React from 'react';
import SpecialtyAssessmentHub from '../assessments/SpecialtyAssessmentHub';

export default function GrammarHub() {
    return (
        <SpecialtyAssessmentHub
            title="Grammar Galaxy"
            subtitle="Master the rules of language, reading, and writing 📝"
            topics={[
                { id: 'NOUNS_VERBS', label: 'Nouns & Verbs', icon: '🧑‍🚀' },
                { id: 'TENSES', label: 'Time Tenses', icon: '⏳' },
                { id: 'PUNCTUATION', label: 'Punctuation', icon: '❗️' },
                { id: 'ADJECTIVES', label: 'Adjectives', icon: '🎨' }
            ]}
            primaryColor="#38bdf8" 
            secondaryColor="#0284c7"
            icon="🌌"
            ambientSymbols={['📝', '✍️', '📖', '🗣️', '✨', '🌍']}
        />
    );
}