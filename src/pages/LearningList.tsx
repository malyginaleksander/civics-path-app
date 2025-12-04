import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, CheckCircle, Circle, Filter, BookOpen } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBar } from '@/components/StatusBar';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getQuestionById, categories, Question } from '@/data/questions';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'still-learning' | 'known';

const LearningList = () => {
  const navigate = useNavigate();
  const { learningList, removeFromLearningList, updateLearningStatus } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return learningList;
    return learningList.filter(item => item.status === filter);
  }, [learningList, filter]);

  const itemsWithQuestions = useMemo(() => {
    return filteredItems
      .map(item => ({
        ...item,
        question: getQuestionById(item.questionId),
      }))
      .filter(item => item.question) as Array<{
        questionId: number;
        status: 'still-learning' | 'known';
        addedAt: string;
        question: Question;
      }>;
  }, [filteredItems]);

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, typeof itemsWithQuestions> = {};
    
    itemsWithQuestions.forEach(item => {
      const category = item.question.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [itemsWithQuestions]);

  const stillLearningCount = learningList.filter(l => l.status === 'still-learning').length;
  const knownCount = learningList.filter(l => l.status === 'known').length;

  const handleNextCard = () => {
    if (currentCardIndex < itemsWithQuestions.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setShowFlashcard(false);
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleRating = (questionId: number, status: 'still-learning' | 'known') => {
    updateLearningStatus(questionId, status);
    handleNextCard();
  };

  // Flashcard Mode
  if (showFlashcard && itemsWithQuestions.length > 0) {
    const currentItem = itemsWithQuestions[currentCardIndex];
    
    return (
      <div className="min-h-screen bg-background safe-area-top">
        <StatusBar />
        <PageHeader 
          title="Learning Session" 
          subtitle={`Card ${currentCardIndex + 1} of ${itemsWithQuestions.length}`}
          showBack
          rightContent={
            <Button variant="ghost" size="sm" onClick={() => setShowFlashcard(false)}>
              Exit
            </Button>
          }
        />

        <div className="px-4 py-6 max-w-3xl mx-auto">
          {/* Progress */}
          <div className="w-full h-2 bg-secondary rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / itemsWithQuestions.length) * 100}%` }}
            />
          </div>

          {/* Flashcard */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000"
          >
            <div className={cn(
              'bg-card rounded-2xl card-shadow-lg p-8 min-h-[300px] flex flex-col justify-center text-center transition-transform duration-500',
              isFlipped && 'bg-success/5'
            )}>
              {!isFlipped ? (
                <>
                  <span className="text-sm text-muted-foreground mb-4">
                    {categories[currentItem.question.category].icon} {categories[currentItem.question.category].name}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground leading-relaxed">
                    {currentItem.question.question}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-4">
                    Tap to reveal answer
                  </p>
                </>
              ) : (
                <>
                  <span className="text-sm text-success mb-4 font-medium">Answer</span>
                  <p className="text-xl font-semibold text-success mb-4">
                    {currentItem.question.correctAnswers[0]}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {currentItem.question.explanation}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="mt-6 space-y-3 animate-fade-in">
              <p className="text-center text-sm text-muted-foreground mb-3">
                How well do you know this?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-14 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                  onClick={() => handleRating(currentItem.questionId, 'still-learning')}
                >
                  Still Learning
                </Button>
                <Button
                  className="h-14 bg-success hover:bg-success/90"
                  onClick={() => handleRating(currentItem.questionId, 'known')}
                >
                  I Know This!
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={handleNextCard}
            >
              {currentCardIndex < itemsWithQuestions.length - 1 ? 'Skip' : 'Finish'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <PageHeader title="Learning List" subtitle={`${learningList.length} questions saved`} />

      <div className="px-4 py-4 max-w-3xl mx-auto">
        {learningList.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <BookOpen size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Saved</h3>
            <p className="text-muted-foreground mb-6">
              Add questions from Study Mode or Practice Tests to review later
            </p>
            <Button onClick={() => navigate('/study')}>
              Browse Questions
            </Button>
          </div>
        ) : (
          <>
            {/* Stats & Actions */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-sm bg-warning/10 text-warning">
                  {stillLearningCount} learning
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-success/10 text-success">
                  {knownCount} known
                </span>
              </div>
              <Button
                onClick={() => setShowFlashcard(true)}
                disabled={itemsWithQuestions.length === 0}
              >
                <Play size={18} className="mr-2" />
                Start Session
              </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['all', 'still-learning', 'known'] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="shrink-0"
                >
                  {f === 'all' ? 'All' : f === 'still-learning' ? 'Still Learning' : 'Known'}
                </Button>
              ))}
            </div>

            {/* Questions by Category */}
            <div className="space-y-6">
              {Object.entries(groupedByCategory).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{categories[category as keyof typeof categories]?.icon}</span>
                    <h3 className="font-semibold text-foreground">
                      {categories[category as keyof typeof categories]?.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">({items.length})</span>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div 
                        key={item.questionId}
                        className="bg-card rounded-xl p-4 card-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => updateLearningStatus(
                              item.questionId, 
                              item.status === 'known' ? 'still-learning' : 'known'
                            )}
                            className="shrink-0 mt-0.5"
                          >
                            {item.status === 'known' ? (
                              <CheckCircle size={20} className="text-success" />
                            ) : (
                              <Circle size={20} className="text-warning" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm leading-relaxed">
                              {item.question.question}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.question.correctAnswers[0]}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromLearningList(item.questionId)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Practice Mode Link */}
            {stillLearningCount > 0 && (
              <div className="mt-8">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/practice?mode=learning')}
                >
                  Practice Quiz Mode ({stillLearningCount} questions)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default LearningList;
