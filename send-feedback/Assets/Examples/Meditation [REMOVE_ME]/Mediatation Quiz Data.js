const quizData = Promise.resolve({
    'questions': [{
            'question': 'Do you wish to send your rating?',
            'answers': [ 'No', 'Yes' ]
        
    }],
    'results': [
        { 'text': 'Your rating has been sent successfully!', 'scene': 0, '0': 1 },
        { 'text': 'Redirecting...', 'scene': 0, '0': 0 },
    ]

});

script.getQuizData = () => quizData;
