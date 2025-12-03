import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { questions, categories, Question } from '@/data/questions';
import { useApp } from '@/contexts/AppContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { cn } from '@/lib/utils';
import { Bookmark, BookmarkCheck } from 'lucide-react';

const StudyMode = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as Question['category'] | null;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialCategory);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  
  const { seenQuestions, markQuestionAsSeen, isInLearningList, addToLearningList, removeFromLearningList } = useApp();
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questions;
    
    const query = searchQuery.toLowerCase();
    return questions.filter(q => 
      q.question.toLowerCase().includes(query) ||
      q.answers.some(a => a.toLowerCase().includes(query))
    );
  }, [searchQuery]);

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
      <PageHeader title="Study All Questions" subtitle={`${questions.length} official USCIS questions`} />

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
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                      Answer
                                    </p>
                                    <div className="space-y-1">
                                      {question.correctAnswers.map((answer, index) => (
                                        <p key={index} className="text-success font-medium">
                                          ✓ {answer}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
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
