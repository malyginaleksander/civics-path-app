import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Target, ChevronRight, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useApp, TestResult } from '@/contexts/AppContext';
import { getQuestionById } from '@/data/questions';
import { cn } from '@/lib/utils';

const Results = () => {
  const navigate = useNavigate();
  const { testResults, clearTestResults } = useApp();
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedResult) {
    const wrongAnswers = selectedResult.answers.filter(a => !a.isCorrect);
    
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader 
          title="Test Details" 
          showBack
          rightContent={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedResult(null)}
            >
              Close
            </Button>
          }
        />

        <div className="px-4 py-6 max-w-3xl mx-auto">
          {/* Score Overview */}
          <div className={cn(
            'rounded-2xl p-6 text-center mb-6',
            selectedResult.accuracy >= 60 ? 'bg-success/10' : 'bg-destructive/10'
          )}>
            <p className="text-4xl font-bold text-foreground mb-1">
              {selectedResult.score}/{selectedResult.totalQuestions}
            </p>
            <p className={cn(
              'text-lg font-semibold',
              selectedResult.accuracy >= 60 ? 'text-success' : 'text-destructive'
            )}>
              {selectedResult.accuracy}% Accuracy
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {formatDate(selectedResult.date)} • {formatTime(selectedResult.timeSpent)}
            </p>
          </div>

          {/* All Answers */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">All Questions</h3>
            {selectedResult.answers.map((answer, index) => {
              const question = getQuestionById(answer.questionId);
              if (!question) return null;

              return (
                <div 
                  key={index} 
                  className={cn(
                    'bg-card rounded-xl p-4 card-shadow border-l-4',
                    answer.isCorrect ? 'border-l-success' : 'border-l-destructive'
                  )}
                >
                  <p className="font-medium text-foreground mb-2 text-sm">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-1">
                    <p className={cn(
                      'text-sm',
                      answer.isCorrect ? 'text-success' : 'text-destructive'
                    )}>
                      Your answer: {answer.selectedAnswer}
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-sm text-success">
                        Correct: {question.correctAnswers[0]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {wrongAnswers.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={() => navigate(`/practice?mode=wrong&questions=${wrongAnswers.map(a => a.questionId).join(',')}`)}
                className="w-full"
              >
                Practice {wrongAnswers.length} Wrong Answers
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <PageHeader 
        title="Past Results"
        rightContent={
          testResults.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('Clear all test results?')) {
                  clearTestResults();
                }
              }}
            >
              <Trash2 size={20} />
            </Button>
          )
        }
      />

      <div className="px-4 py-6 max-w-3xl mx-auto">
        {testResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Target size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete a practice test to see your results here
            </p>
            <Button onClick={() => navigate('/practice')}>
              Start Practice Test
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {testResults.map((result) => (
              <button
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className="w-full bg-card rounded-xl p-4 card-shadow text-left hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        'text-2xl font-bold',
                        result.accuracy >= 60 ? 'text-success' : 'text-destructive'
                      )}>
                        {result.score}/{result.totalQuestions}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        result.accuracy >= 60 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                      )}>
                        {result.accuracy}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(result.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(result.timeSpent)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Results;
