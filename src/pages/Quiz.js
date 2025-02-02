import React, {useEffect, useState} from 'react';
import '../assets/styles/quiz.css';
import QuestionIndex from '../components/QuestionIndex';
import { useUser } from '../contexts/UserContext';
import QuizTitle from '../components/QuizTitle';
import QuestionBox from '../components/QuestionBox';
import LoadingScreen from '../components/LoadingScreen';
import shuffle from '../utils/randomizeArray';
import { getQuizById } from '../services/quiz';
import Evaluation from '../components/Evaluation';
import FavorizationButton from '../components/FavorizationButton';

export default function Quiz() {

  const { currentUser } = useUser();

  const [loading,setLoading] = useState(true)

  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [author, setAuthor] = useState();

  useEffect(() => {
    const quizID = new URLSearchParams(window.location.search).get('id');
    
    getQuizById({id: quizID}).then(response => {
      const quiz = response.data.quiz;

      quiz.questions = randomizeQuestions(quiz.questions);
      setQuizData(quiz);

      setCorrectAnswers(getCorrectAnswers(quiz.questions));
      setAuthor(quiz.author[0]?.username);
      setLoading(false);
    });
  },[]);

  function getCorrectAnswers(questions){
    const correctAnswersTemp = [];
    questions.forEach(question => {
      const correctQuestionAnswers = question.answers.filter(answer => answer.isTrue);
      correctAnswersTemp.push(correctQuestionAnswers);
    });
    return correctAnswersTemp;
  }

  function randomizeQuestions(questions){
    questions = shuffle(questions);
    questions.map(question => {return {...question, answers: shuffle(question.answers)}}); //Randomize Answer Position
    return questions;
  }

  let submitQuiz = () => {
    alert('Das Quiz wurde Abgeschlossen');
    setIsSubmitted(true);
  }

  

  if(loading) return <LoadingScreen fullscreen={true}/>
  if(!quizData) return null;
  return (
    <main className='quiz'>

      {currentUser && <section className='quiz-interaction-buttons'><FavorizationButton quizId={quizData.id}/></section>}

      <QuizTitle title={quizData.title} author={author || 'gelöschter Nutzer'}/>

      <section className='quiz-game'>
        <QuestionIndex questions={quizData.questions} isSubmitted={isSubmitted} correctAnswers={correctAnswers} answers={answers} setCurrentQuestionIndex={setCurrentQuestionIndex} currentQuestionIndex={currentQuestionIndex}/>
        <QuestionBox quizData={quizData} currentQuestionIndex={currentQuestionIndex} setCurrentQuestionIndex={setCurrentQuestionIndex} isSubmitted={isSubmitted} submitQuiz={submitQuiz} answers={answers} setAnswers={setAnswers}/>
        {isSubmitted && <button onClick={() => window.location.reload()}>Quiz wiederholen</button>}
      </section>

      {
       isSubmitted && <Evaluation correctAnswers={correctAnswers} answers={answers} questions={quizData.questions}/> 
      }
    </main>
  )
}
