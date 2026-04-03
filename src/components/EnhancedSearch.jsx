import React, { useState, useEffect, useRef } from 'react';
import './EnhancedSearch.css';

/**
 * Futuristic AI-Powered Search Component
 * Features: Fuzzy matching, relevance scoring, smart suggestions, recent searches
 */
export default function EnhancedSearch({
    allFeatures,
    onResultClick,
    onClose,
    user
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeFilter, setActiveFilter] = useState('all');
    const inputRef = useRef(null);

    const categories = ['all', 'Pre-K', 'Math', 'Games', 'Reading', 'Assessment', 'AI'];

    // Popular searches based on user role
    const popularSearches = user?.role === 'STUDENT'
        ? ['games', 'math challenge', 'reading', 'drawing']
        : user?.role === 'TEACHER'
        ? ['assessments', 'worksheets', 'analytics', 'assignments']
        : ['multiplication', 'addition', 'shapes', 'colors', 'sudoku'];

    useEffect(() => {
        // Load recent searches from localStorage
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }

        // Focus input on mount
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (query.trim().length < 1) {
            setResults([]);
            setSelectedIndex(0);
            return;
        }

        const searchResults = performIntelligentSearch(query, activeFilter);
        setResults(searchResults);
        setSelectedIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeFilter]);

    /**
     * Intelligent search with fuzzy matching and relevance scoring
     */
    const performIntelligentSearch = (searchQuery, filter) => {
        const lowerQuery = searchQuery.toLowerCase().trim();
        const words = lowerQuery.split(' ');

        let scored = allFeatures.map(feature => {
            let score = 0;
            const featureText = `${feature.name} ${feature.description} ${feature.category} ${feature.keywords.join(' ')}`.toLowerCase();

            // Exact name match - highest priority
            if (feature.name.toLowerCase() === lowerQuery) {
                score += 100;
            }

            // Name starts with query - very high priority
            if (feature.name.toLowerCase().startsWith(lowerQuery)) {
                score += 50;
            }

            // Name contains query - high priority
            if (feature.name.toLowerCase().includes(lowerQuery)) {
                score += 30;
            }

            // Keyword exact match - high priority
            if (feature.keywords.some(k => k === lowerQuery)) {
                score += 40;
            }

            // Keyword starts with query
            if (feature.keywords.some(k => k.startsWith(lowerQuery))) {
                score += 25;
            }

            // Keyword contains query
            if (feature.keywords.some(k => k.includes(lowerQuery))) {
                score += 15;
            }

            // Description contains query
            if (feature.description.toLowerCase().includes(lowerQuery)) {
                score += 10;
            }

            // Multi-word search - all words present
            if (words.length > 1) {
                const allWordsPresent = words.every(word => featureText.includes(word));
                if (allWordsPresent) {
                    score += 20;
                }
            }

            // Fuzzy matching for typos (Levenshtein distance)
            const fuzzyMatch = checkFuzzyMatch(lowerQuery, feature.name.toLowerCase());
            if (fuzzyMatch > 0.7) {
                score += Math.floor(fuzzyMatch * 20);
            }

            // Category match bonus
            if (filter !== 'all' && feature.category === filter) {
                score += 5;
            }

            return { ...feature, score };
        });

        // Filter by category
        if (filter !== 'all') {
            scored = scored.filter(item => item.category === filter);
        }

        // Filter out zero scores and sort by score
        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8); // Top 8 results
    };

    /**
     * Fuzzy matching using Levenshtein distance
     */
    const checkFuzzyMatch = (s1, s2) => {
        const maxLen = Math.max(s1.length, s2.length);
        if (maxLen === 0) return 1;

        const distance = levenshteinDistance(s1, s2);
        return 1 - distance / maxLen;
    };

    const levenshteinDistance = (s1, s2) => {
        const matrix = [];

        for (let i = 0; i <= s2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= s1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= s2.length; i++) {
            for (let j = 1; j <= s1.length; j++) {
                if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[s2.length][s1.length];
    };

    const handleResultClick = (feature) => {
        // Save to recent searches
        const updated = [
            feature.name,
            ...recentSearches.filter(s => s !== feature.name)
        ].slice(0, 5);

        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        onResultClick(feature);
        onClose();
    };

    const handleQuickSearch = (searchTerm) => {
        setQuery(searchTerm);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            handleResultClick(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const clearSearch = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const getRelevanceColor = (score) => {
        if (score >= 50) return '#10b981'; // Green - highly relevant
        if (score >= 30) return '#3b82f6'; // Blue - relevant
        if (score >= 15) return '#f59e0b'; // Orange - moderately relevant
        return '#6b7280'; // Gray - less relevant
    };

    return (
        <>
            <div className="enhanced-search-backdrop" onClick={onClose} />
            <div className="enhanced-search-modal">
                <div className="search-header">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for games, activities, assessments..."
                            className="search-input"
                            autoComplete="off"
                        />
                        {query && (
                            <button onClick={clearSearch} className="clear-btn">✕</button>
                        )}
                    </div>
                    <button onClick={onClose} className="close-search-btn">✕</button>
                </div>

                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-chip ${activeFilter === cat ? 'active' : ''}`}
                            onClick={() => setActiveFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="search-content">
                    {query.length > 0 && results.length > 0 && (
                        <div className="search-section">
                            <div className="section-header">
                                <span className="section-title">🎯 Results ({results.length})</span>
                                <span className="section-hint">↑↓ to navigate, ⏎ to select</span>
                            </div>
                            <div className="results-list">
                                {results.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className={`result-item ${idx === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleResultClick(result)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                    >
                                        <span className="result-icon">{result.icon}</span>
                                        <div className="result-info">
                                            <div className="result-name">{result.name}</div>
                                            <div className="result-description">{result.description}</div>
                                        </div>
                                        <div className="result-meta">
                                            <span className="result-category">{result.category}</span>
                                            <span
                                                className="relevance-score"
                                                style={{ color: getRelevanceColor(result.score) }}
                                            >
                                                {result.score >= 50 ? '★★★' : result.score >= 30 ? '★★' : '★'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {query.length > 0 && results.length === 0 && (
                        <div className="no-results">
                            <span className="no-results-icon">🔍</span>
                            <p>No results found for "{query}"</p>
                            <small>Try different keywords or check spelling</small>
                        </div>
                    )}

                    {query.length === 0 && (
                        <>
                            {recentSearches.length > 0 && (
                                <div className="search-section">
                                    <div className="section-header">
                                        <span className="section-title">🕐 Recent Searches</span>
                                        <button onClick={clearRecentSearches} className="clear-recent-btn">
                                            Clear
                                        </button>
                                    </div>
                                    <div className="quick-chips">
                                        {recentSearches.map((term, idx) => (
                                            <button
                                                key={idx}
                                                className="quick-chip"
                                                onClick={() => handleQuickSearch(term)}
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="search-section">
                                <div className="section-header">
                                    <span className="section-title">🔥 Popular Searches</span>
                                </div>
                                <div className="quick-chips">
                                    {popularSearches.map((term, idx) => (
                                        <button
                                            key={idx}
                                            className="quick-chip popular"
                                            onClick={() => handleQuickSearch(term)}
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="search-section">
                                <div className="section-header">
                                    <span className="section-title">⚡ Quick Actions</span>
                                </div>
                                <div className="quick-actions">
                                    <button className="quick-action" onClick={() => handleQuickSearch('new assessment')}>
                                        📝 Start New Assessment
                                    </button>
                                    <button className="quick-action" onClick={() => handleQuickSearch('worksheets')}>
                                        🖨️ Generate Worksheet
                                    </button>
                                    <button className="quick-action" onClick={() => handleQuickSearch('games')}>
                                        🎮 Play Games
                                    </button>
                                    <button className="quick-action" onClick={() => handleQuickSearch('reading')}>
                                        📚 Read Stories
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="search-footer">
                    <span className="search-tip">
                        💡 Tip: Use filters above to narrow your search
                    </span>
                </div>
            </div>
        </>
    );
}
