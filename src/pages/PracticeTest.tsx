import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuestionCard } from '@/components/QuestionCard';
import { PageHeader } from '@/components/PageHeader';
import { questions, getRandomQuestions, getQuestionById, Question } from '@/data/questions';
import { useApp, TestResult } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface Answer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

const PracticeTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addTestResult, markQuestionAsSeen, learningList } = useApp();

  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  // Initialize / reset test when route params change (not when learningList changes)
  useEffect(() => {
    // Reset state so "Start New Test" works even when staying on /practice
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(undefined);
    setShowResult(false);
    setIsComplete(false);
    setTimeSpent(0);
    setStartTime(Date.now());

    const mode = searchParams.get('mode');
    const questionIds = searchParams.get('questions');

    if (mode === 'wrong' && questionIds) {
      // Practice wrong answers from a previous test
      const ids = questionIds.split(',').map(Number);
      const wrongQuestions = ids
        .map(id => getQuestionById(id))
        .filter(Boolean) as Question[];
      setTestQuestions(wrongQuestions);
    } else if (mode === 'learning') {
      // Practice from learning list - capture current state at test start
      const currentLearningList = learningList;
      const learningQuestions = currentLearningList
        .filter(l => l.status === 'still-learning')
        .map(l => getQuestionById(l.questionId))
        .filter(Boolean) as Question[];
      setTestQuestions(learningQuestions.length > 0 ? learningQuestions.slice(0, 20) : getRandomQuestions(20));
    } else if (mode === 'weak') {
      // Practice weak areas - will be populated from context
      setTestQuestions(getRandomQuestions(20));
    } else {
      // Standard practice test
      setTestQuestions(getRandomQuestions(20));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update time spent
  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, startTime]);

  const currentQuestion = testQuestions[currentIndex];
  const progress = testQuestions.length > 0 ? ((currentIndex + 1) / testQuestions.length) * 100 : 0;

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion.correctAnswers[0];
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
    }]);

    markQuestionAsSeen(currentQuestion.id);
  };

  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(undefined);
      setShowResult(false);
    } else {
      completeTest();
    }
  };

  const completeTest = useCallback(() => {
    const correctCount = answers.length > 0 
      ? answers.filter(a => a.isCorrect).length 
      : 0;
    
    const result: TestResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: correctCount,
      totalQuestions: testQuestions.length,
      accuracy: testQuestions.length > 0 ? Math.round((correctCount / testQuestions.length) * 100) : 0,
      timeSpent,
      answers,
    };

    addTestResult(result);
    setIsComplete(true);
  }, [answers, testQuestions.length, timeSpent, addTestResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wrongAnswers = answers.filter(a => !a.isCorrect);
  const correctCount = answers.filter(a => a.isCorrect).length;

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-[env(safe-area-inset-top,0px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((correctCount / testQuestions.length) * 100);
    const passed = accuracy >= 60;

    return (
      <div className="min-h-screen bg-background pt-[env(safe-area-inset-top,0px)]">
        <PageHeader title="Test Complete" />
        
        <div className="px-4 py-6 max-w-3xl mx-auto">
          {/* Score Card */}
          <div className={cn(
            'rounded-2xl p-8 text-center mb-6',
            passed ? 'bg-success/10' : 'bg-destructive/10'
          )}>
            <div className={cn(
              'inline-flex items-center justify-center w-20 h-20 rounded-full mb-4',
              passed ? 'bg-success' : 'bg-destructive'
            )}>
              {passed ? (
                <CheckCircle size={40} className="text-success-foreground" />
              ) : (
                <XCircle size={40} className="text-destructive-foreground" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {correctCount}/{testQuestions.length}
            </h2>
            <p className={cn(
              'text-lg font-semibold',
              passed ? 'text-success' : 'text-destructive'
            )}>
              {accuracy}% {passed ? 'Passed!' : 'Keep Practicing'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 text-center card-shadow">
              <Clock size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-xl font-bold text-foreground">{formatTime(timeSpent)}</p>
              <p className="text-sm text-muted-foreground">Time Spent</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center card-shadow">
              <XCircle size={24} className="mx-auto mb-2 text-destructive" />
              <p className="text-xl font-bold text-foreground">{wrongAnswers.length}</p>
              <p className="text-sm text-muted-foreground">Wrong Answers</p>
            </div>
          </div>

          {/* Wrong Answers Review */}
          {wrongAnswers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Review Wrong Answers</h3>
              <div className="space-y-3">
                {wrongAnswers.map((answer, index) => {
                  const question = getQuestionById(answer.questionId);
                  if (!question) return null;
                  
                  return (
                    <div key={index} className="bg-card rounded-xl p-4 card-shadow">
                      <p className="font-medium text-foreground mb-2">{question.question}</p>
                      <p className="text-sm text-destructive">Your answer: {answer.selectedAnswer}</p>
                      <p className="text-sm text-success">Correct: {question.correctAnswers[0]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {wrongAnswers.length > 0 && (
              <Button
                onClick={() => navigate(`/practice?mode=wrong&questions=${wrongAnswers.map(a => a.questionId).join(',')}`)}
                className="w-full"
                variant="default"
              >
                <RotateCcw size={20} className="mr-2" />
                Practice Wrong Answers
              </Button>
            )}
            <Button
              onClick={() => navigate(`/practice?run=${Date.now()}`)}
              className="w-full"
              variant="outline"
            >
              Start New Test
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              variant="ghost"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[env(safe-area-inset-top,0px)]">
      <PageHeader 
        title="Practice Test" 
        subtitle={`Question ${currentIndex + 1} of ${testQuestions.length}`}
        showBack
      />

      {/* Progress Bar */}
      <div className="px-4 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatTime(timeSpent)}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6 max-w-3xl mx-auto">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
            showResult={showResult}
            questionNumber={currentIndex + 1}
          />
        )}

        {/* Next Button */}
        {showResult && (
          <div className="mt-6 pb-[env(safe-area-inset-bottom,24px)]">
            <Button
              onClick={handleNext}
              className="w-full"
              size="lg"
            >
              {currentIndex < testQuestions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight size={20} className="ml-2" />
                </>
              ) : (
                'View Results'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeTest;
