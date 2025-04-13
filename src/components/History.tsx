'use client';

import { useState, useEffect } from 'react';
import { Search, Star, StarOff, Trash2, Edit2 } from 'lucide-react';

interface Summarization {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  timestamp: number;
  isFavorite: boolean;
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [summarizations, setSummarizations] = useState<Summarization[]>([]);

  useEffect(() => {
    // Load summarizations from localStorage on component mount
    const savedSummarizations = localStorage.getItem('summarizations');
    if (savedSummarizations) {
      setSummarizations(JSON.parse(savedSummarizations));
    }
  }, []);

  const filteredSummarizations = summarizations
    .filter(sum => 
      sum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sum.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isFavorite === b.isFavorite) {
        return b.timestamp - a.timestamp;
      }
      return a.isFavorite ? -1 : 1;
    });

  const toggleFavorite = (id: string) => {
    const updatedSummarizations = summarizations.map(sum => 
      sum.id === id ? { ...sum, isFavorite: !sum.isFavorite } : sum
    );
    setSummarizations(updatedSummarizations);
    localStorage.setItem('summarizations', JSON.stringify(updatedSummarizations));
  };

  const removeSummarization = (id: string) => {
    const updatedSummarizations = summarizations.filter(sum => sum.id !== id);
    setSummarizations(updatedSummarizations);
    localStorage.setItem('summarizations', JSON.stringify(updatedSummarizations));
  };

  const renameSummarization = (id: string, newTitle: string) => {
    const updatedSummarizations = summarizations.map(sum =>
      sum.id === id ? { ...sum, title: newTitle } : sum
    );
    setSummarizations(updatedSummarizations);
    localStorage.setItem('summarizations', JSON.stringify(updatedSummarizations));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">History</h2>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-md border bg-background"
        />
      </div>

      <div className="space-y-2">
        {filteredSummarizations.map((sum) => (
          <div
            key={sum.id}
            className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{sum.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{sum.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground">
                    {sum.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sum.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFavorite(sum.id)}
                  className="p-1 hover:bg-accent rounded-md"
                >
                  {sum.isFavorite ? (
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff size={16} className="text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => removeSummarization(sum.id)}
                  className="p-1 hover:bg-accent rounded-md text-destructive"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    const newTitle = prompt('Enter new title:', sum.title);
                    if (newTitle) renameSummarization(sum.id, newTitle);
                  }}
                  className="p-1 hover:bg-accent rounded-md"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 