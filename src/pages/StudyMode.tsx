import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Volume2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { questions, categories, Question, getAllSeniorQuestions } from '@/data/questions';
import { useApp } from '@/contexts/AppContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getDynamicAnswers } from '@/lib/dynamicAnswers';

const StudyMode = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as Question['category'] | null;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialCategory);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  
  const { seenQuestions, markQuestionAsSeen, isInLearningList, addToLearningList, removeFromLearningList, settings } = useApp();
  const { speak, stop, isSpeaking } = useTextToSpeech();

  // Get the base questions list based on senior mode
  const baseQuestions = settings.seniorMode ? getAllSeniorQuestions() : questions;

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return baseQuestions;
    
    const query = searchQuery.toLowerCase();
    return baseQuestions.filter(q => 
      q.question.toLowerCase().includes(query) ||
      q.answers.some(a => a.toLowerCase().includes(query))
    );
  }, [searchQuery, baseQuestions]);

  const questionsByCategory = useMemo(() => {
    const grouped: Record<string, Question[]> = {
      government: [],
      history: [],
      civics: [],
    };
    
    filteredQuestions.forEach(q => {
      grouped[q.category].push(q);
    });
    
    return grouped;
  }, [filteredQuestions]);

  const handleToggleQuestion = (questionId: number) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
      markQuestionAsSeen(questionId);
    }
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const handleSpeakQuestionAndAnswer = (question: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      // Use dynamic answers if available
      const dynamicData = getDynamicAnswers(question, settings.selectedState, settings.customOfficials);
      const effectiveAnswers = dynamicData?.correctAnswers || question.correctAnswers;
      const text = `${question.question}. The answer is: ${effectiveAnswers.join(', or ')}`;
      speak(text);
    }
  };

  const toggleLearningList = (questionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLearningList(questionId)) {
      removeFromLearningList(questionId);
    } else {
      addToLearningList(questionId);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title={settings.seniorMode ? "Senior Questions (65/20)" : "Study All Questions"} 
        subtitle={`${baseQuestions.length} ${settings.seniorMode ? 'specially marked' : 'official USCIS'} questions`} 
      />

      <div className="px-4 py-4 max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(categories).map(([key, category]) => {
            const categoryQuestions = questionsByCategory[key] || [];
            const seenCount = categoryQuestions.filter(q => seenQuestions.includes(q.id)).length;
            const learningCount = categoryQuestions.filter(q => isInLearningList(q.id)).length;
            const isExpanded = expandedCategory === key;

            return (
              <div key={key} className="bg-card rounded-xl card-shadow overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-accent transition-colors"
                >
                  <span className="text-3xl">{category.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {seenCount}/{categoryQuestions.length} studied
                      {learningCount > 0 && ` • ${learningCount} in learning list`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${categoryQuestions.length > 0 ? (seenCount / categoryQuestions.length) * 100 : 0}%` }}
                      />
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {categoryQuestions.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground">
                        No questions found
                      </p>
                    ) : (
                      categoryQuestions.map((question) => {
                        const isQuestionExpanded = expandedQuestion === question.id;
                        const inLearningList = isInLearningList(question.id);
                        const isSeen = seenQuestions.includes(question.id);

                        return (
                          <div key={question.id} className="border-b border-border last:border-b-0">
                            <button
                              onClick={() => handleToggleQuestion(question.id)}
                              className={cn(
                                'w-full p-4 text-left hover:bg-accent transition-colors',
                                isQuestionExpanded && 'bg-accent'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <span className={cn(
                                  'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                                  isSeen ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                )}>
                                  {question.id}
                                </span>
                                <p className="flex-1 text-foreground text-sm leading-relaxed">
                                  {question.question}
                                </p>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => handleSpeak(question.question, e)}
                                  >
                                    <Volume2 size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => toggleLearningList(question.id, e)}
                                  >
                                    {inLearningList ? (
                                      <BookmarkCheck size={16} className="text-primary" />
                                    ) : (
                                      <Bookmark size={16} />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </button>

                            {isQuestionExpanded && (
                              <div className="px-4 pb-4 animate-fade-in">
                                <div className="ml-9 space-y-3">
                                  {/* Dynamic answer info */}
                                  {(() => {
                                    const dynamicData = getDynamicAnswers(question, settings.selectedState, settings.customOfficials);
                                    const effectiveCorrectAnswers = dynamicData?.correctAnswers || question.correctAnswers;
                                    const needsStateSelection = dynamicData?.needsStateSelection || false;
                                    
                                    return (
                                      <>
                                        {question.dynamicAnswer && (
                                          <div className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded inline-block">
                                            Answer varies • Updated Jan 2025
                                          </div>
                                        )}
                                        
                                        {needsStateSelection && (
                                          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
                                            <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-sm font-medium text-warning">Select your state</p>
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {dynamicData?.hint}
                                              </p>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 h-7 text-xs"
                                                onClick={() => navigate('/settings')}
                                              >
                                                Go to Settings
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                              {needsStateSelection ? 'Correct Answer (select state first)' : 'Answer'}
                                            </p>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 text-xs"
                                              onClick={(e) => handleSpeakQuestionAndAnswer(question, e)}
                                            >
                                              <Volume2 size={14} className="mr-1" />
                                              Listen
                                            </Button>
                                          </div>
                                          <div className="space-y-1">
                                            {effectiveCorrectAnswers.map((answer, index) => (
                                              <p key={index} className="text-success font-medium">
                                                ✓ {answer}
                                              </p>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                  
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                      Explanation
                                    </p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                      {question.explanation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default StudyMode;
