import React from 'react';
import SpecialtyAssessmentHub from './SpecialtyAssessmentHub';

export default function CriticalThinkingHub() {
    return (
        <SpecialtyAssessmentHub
            title="Logic Nexus"
            subtitle="Engage your neural pathways to solve puzzles and recognize patterns 🧩"
            topics={[
                { id: 'LOGIC_PUZZLES', label: 'Logic Puzzles', icon: '🧠' },
                { id: 'PATTERN_MATCHING', label: 'Pattern Sync', icon: '💠' },
                { id: 'RIDDLES', label: 'Riddles', icon: '🕵️' },
                { id: 'SEQUENCES', label: 'Sequences', icon: '🔢' }
            ]}
            primaryColor="#10b981" 
            secondaryColor="#047857"
            icon="🤖"
            ambientSymbols={['🧠', '💠', '❓', '🔢', '⚙️', '⚡']}
        />
    );
}