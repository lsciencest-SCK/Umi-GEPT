
import { Question, QuizMode, DialoguePart } from './types';

const qrTemplates = [
  { q: "Where do you play soccer?", ans: ["In the field.", "At ten o'clock.", "He is my teacher.", "Yes, please."], correct: "In the field.", explain: "Where 問地點。" },
  { q: "Who is that girl?", ans: ["She is my sister.", "It is a book.", "I am eating.", "No, it isn't."], correct: "She is my sister.", explain: "Who 問人物。" },
  { q: "When is the party?", ans: ["At 7 PM.", "In the park.", "It is fun.", "I like cake."], correct: "At 7 PM.", explain: "When 問時間。" },
  { q: "How often do you swim?", ans: ["Twice a week.", "In the pool.", "Yes, I do.", "With my friend."], correct: "Twice a week.", explain: "How often 問頻率。" },
  { q: "Why are you late?", ans: ["Because I missed the bus.", "I am happy.", "At school.", "Tomorrow."], correct: "Because I missed the bus.", explain: "Why 問原因。" },
  { q: "What is your name?", ans: ["My name is Sam.", "I am ten.", "I like blue.", "Yes, it is."], correct: "My name is Sam.", explain: "What 問姓名。" },
  { q: "How do you go to school?", ans: ["By bus.", "At 8 AM.", "It is far.", "I like school."], correct: "By bus.", explain: "How 問方式。" },
  { q: "Whose bag is this?", ans: ["It's mine.", "It's a bag.", "Under the desk.", "In the morning."], correct: "It's mine.", explain: "Whose 問所有權。" },
  { q: "What time is it?", ans: ["It is 5:30.", "It is a watch.", "I am busy.", "On Monday."], correct: "It is 5:30.", explain: "問具體時間。" },
  { q: "Is he a doctor?", ans: ["Yes, he is.", "No, I am not.", "He is fine.", "In the hospital."], correct: "Yes, he is.", explain: "Yes/No 問句。" },
  { q: "Where is my key?", ans: ["On the table.", "Open the door.", "I have it.", "It is red."], correct: "On the table.", explain: "問位置。" },
  { q: "How much is the cake?", ans: ["Ten dollars.", "It is sweet.", "I want two.", "In the bakery."], correct: "Ten dollars.", explain: "How much 問價錢。" },
  { q: "What color do you like?", ans: ["I like yellow.", "It is big.", "Yes, I do.", "At the store."], correct: "I like yellow.", explain: "問顏色。" },
  { q: "Can you help me?", ans: ["Sure, no problem.", "I am sorry.", "You are welcome.", "Help yourself."], correct: "Sure, no problem.", explain: "請求協助。" },
  { q: "What are you doing?", ans: ["I am reading.", "I read books.", "It is a book.", "Yes, I am."], correct: "I am reading.", explain: "現在進行式。" },
  { q: "Do you have a pen?", ans: ["Yes, I do.", "No, it isn't.", "In my bag.", "A blue pen."], correct: "Yes, I do.", explain: "Do 問句。" },
  { q: "Which one is bigger?", ans: ["The red one.", "Yes, it is.", "I like it.", "On the left."], correct: "The red one.", explain: "Which 選擇問句。" },
  { q: "How many eggs are there?", ans: ["There are five.", "They are white.", "In the fridge.", "Yes, please."], correct: "There are five.", explain: "How many 問數量。" },
  { q: "Are you hungry?", ans: ["Yes, very much.", "I am hungry.", "No, I am Sam.", "Bread and milk."], correct: "Yes, very much.", explain: "問感受。" },
  { q: "What's the weather like?", ans: ["It is sunny.", "I like sun.", "In the sky.", "At noon."], correct: "It is sunny.", explain: "問天氣。" },
  { q: "What is your father's job?", ans: ["He is a clerk.", "He is working.", "He is at home.", "He likes me."], correct: "He is a clerk.", explain: "問職業。" },
  { q: "Did you finish your homework?", ans: ["Yes, I did.", "No, I don't.", "At school.", "It is hard."], correct: "Yes, I did.", explain: "過去式問句。" },
  { q: "Where is the library?", ans: ["Next to the park.", "Read a book.", "It is big.", "At 9 AM."], correct: "Next to the park.", explain: "問方位。" },
  { q: "Who is the singer?", ans: ["It is Mary.", "She is singing.", "A good song.", "Yes, she is."], correct: "It is Mary.", explain: "問是誰。" }
];

const scTemplates = [
  { 
    p: [{s: 0, t: "What are you good at?"}, {s: 1, t: "I am good at playing the violin."}], 
    q: "What is the boy good at?", 
    ans: ["Playing the violin.", "Playing soccer.", "Reading novels.", "Drawing."], 
    correct: "Playing the violin.", 
    explain: "提及 violin。" 
  },
  { 
    p: [{s: 0, t: "Is it time for lunch?"}, {s: 1, t: "No, it's ten o'clock. We have to wait."}], 
    q: "What time is it now?", 
    ans: ["Ten o'clock.", "Twelve o'clock.", "Seven o'clock.", "Noon."], 
    correct: "Ten o'clock.", 
    explain: "提及 ten o'clock。" 
  },
  { 
    p: [{s: 0, t: "Who is that man?"}, {s: 1, t: "Oh, he is a famous writer."}], 
    q: "Who is the man?", 
    ans: ["A writer.", "A nurse.", "A teacher.", "A waiter."], 
    correct: "A writer.", 
    explain: "提及 writer。" 
  },
  { 
    p: [{s: 0, t: "How much is the hat?"}, {s: 1, t: "It's 50 dollars."}], 
    q: "How much is the hat?", 
    ans: ["50 dollars.", "15 dollars.", "5 dollars.", "Free."], 
    correct: "50 dollars.", 
    explain: "數字聽取。" 
  },
  { 
    p: [{s: 0, t: "Where is Mom?"}, {s: 1, t: "She is in the kitchen cooking."}], 
    q: "Where is Mom?", 
    ans: ["In the kitchen.", "In the garden.", "In the bedroom.", "At work."], 
    correct: "In the kitchen.", 
    explain: "地點聽取。" 
  },
  { 
    p: [{s: 0, t: "Do you like apples?"}, {s: 1, t: "No, I prefer bananas."}], 
    q: "What does the girl like?", 
    ans: ["Bananas.", "Apples.", "Oranges.", "Grapes."], 
    correct: "Bananas.", 
    explain: "首選偏好。" 
  },
  { 
    p: [{s: 0, t: "When is your birthday?"}, {s: 1, t: "It's on May 5th."}], 
    q: "When is the birthday?", 
    ans: ["May 5th.", "May 15th.", "March 5th.", "July 5th."], 
    correct: "May 5th.", 
    explain: "日期辨識。" 
  },
  { 
    p: [{s: 0, t: "How do you go to school?"}, {s: 1, t: "I walk every day."}], 
    q: "How does he go to school?", 
    ans: ["On foot.", "By bus.", "By bike.", "By car."], 
    correct: "On foot.", 
    explain: "Walk 等於 On foot。" 
  },
  { 
    p: [{s: 0, t: "It's raining outside."}, {s: 1, t: "Don't forget your umbrella."}], 
    q: "What should the person take?", 
    ans: ["An umbrella.", "A hat.", "A coat.", "A bag."], 
    correct: "An umbrella.", 
    explain: "天氣相關物品。" 
  },
  { 
    p: [{s: 0, t: "I'm so thirsty."}, {s: 1, t: "Here is some water."}], 
    q: "What does the person want?", 
    ans: ["Something to drink.", "Something to eat.", "A chair.", "A book."], 
    correct: "Something to drink.", 
    explain: "Thirsty 需求。" 
  },
  { 
    p: [{s: 0, t: "Look at that big bird!"}, {s: 1, t: "Wow, it's very beautiful."}], 
    q: "What are they looking at?", 
    ans: ["A bird.", "A plane.", "A tree.", "A cat."], 
    correct: "A bird.", 
    explain: "主題辨識。" 
  },
  { 
    p: [{s: 0, t: "Can I borrow your pen?"}, {s: 1, t: "Sorry, I am using it."}], 
    q: "Does the girl get the pen?", 
    ans: ["No, she doesn't.", "Yes, she does.", "She has many.", "She is happy."], 
    correct: "No, she doesn't.", 
    explain: "拒絕請求辨識。" 
  },
  { 
    p: [{s: 0, t: "What's for breakfast?"}, {s: 1, t: "Milk and eggs."}], 
    q: "What is for breakfast?", 
    ans: ["Milk and eggs.", "Bread and tea.", "Rice.", "Pizza."], 
    correct: "Milk and eggs.", 
    explain: "食物細節。" 
  },
  { 
    p: [{s: 0, t: "Is the cat under the table?"}, {s: 1, t: "No, it's on the sofa."}], 
    q: "Where is the cat?", 
    ans: ["On the sofa.", "Under the table.", "Behind the door.", "In the box."], 
    correct: "On the sofa.", 
    explain: "方位辨識。" 
  },
  { 
    p: [{s: 0, t: "Why are you crying?"}, {s: 1, t: "I lost my toy car."}], 
    q: "Why is the boy sad?", 
    ans: ["He lost his toy.", "He is hungry.", "He is tired.", "He wants milk."], 
    correct: "He lost his toy.", 
    explain: "原因分析。" 
  },
  { 
    p: [{s: 0, t: "What are you doing?"}, {s: 1, t: "I'm surfing the net."}], 
    q: "What is the boy doing?", 
    ans: ["Using the computer.", "Watching TV.", "Sleeping.", "Reading."], 
    correct: "Using the computer.", 
    explain: "Surfing the net 相關。" 
  },
  { 
    p: [{s: 0, t: "The steak is delicious!"}, {s: 1, t: "Glad you like it."}], 
    q: "How is the food?", 
    ans: ["It's great.", "It's bad.", "It's spicy.", "It's cold."], 
    correct: "It's great.", 
    explain: "美味形容。" 
  },
  { 
    p: [{s: 0, t: "I want to be a pilot."}, {s: 1, t: "That's a cool job."}], 
    q: "What is the girl's dream?", 
    ans: ["To fly planes.", "To build houses.", "To help sick people.", "To teach."], 
    correct: "To fly planes.", 
    explain: "Pilot 飛行員。" 
  },
  { 
    p: [{s: 0, t: "Let's play badminton at recess."}, {s: 1, t: "Great idea!"}], 
    q: "What will they do at recess?", 
    ans: ["Play sports.", "Study math.", "Eat lunch.", "Go home."], 
    correct: "Play sports.", 
    explain: "Badminton 運動類。" 
  },
  { 
    p: [{s: 0, t: "The mail carrier is here."}, {s: 1, t: "Is there a letter for me?"}], 
    q: "Who is at the door?", 
    ans: ["The mail carrier.", "A musician.", "A nurse.", "A clerk."], 
    correct: "The mail carrier.", 
    explain: "人物身分。" 
  },
  { 
    p: [{s: 0, t: "I'm worried about the test."}, {s: 1, t: "Don't be, you studied hard."}], 
    q: "How does the boy feel?", 
    ans: ["Nervous.", "Happy.", "Angry.", "Bored."], 
    correct: "Nervous.", 
    explain: "Worried 等於 Nervous。" 
  },
  { 
    p: [{s: 0, t: "Can you lend me a calculator?"}, {s: 1, t: "Sure, here it is."}], 
    q: "What does the girl borrow?", 
    ans: ["A calculator.", "A book.", "A pen.", "A ruler."], 
    correct: "A calculator.", 
    explain: "物件聽取。" 
  },
  { 
    p: [{s: 0, t: "I'm tired of making spaghetti."}, {s: 1, t: "Let's order pizza then."}], 
    q: "What will they eat?", 
    ans: ["Pizza.", "Spaghetti.", "Steak.", "Salad."], 
    correct: "Pizza.", 
    explain: "最終決定。" 
  },
  { 
    p: [{s: 0, t: "There is a bakery next to the bank."}, {s: 1, t: "I see it."}], 
    q: "Where is the bakery?", 
    ans: ["Beside the bank.", "Across from the park.", "Behind the school.", "Far away."], 
    correct: "Beside the bank.", 
    explain: "Next to 等於 Beside。" 
  }
];

export const generateQuiz = (mode: QuizMode, count: number = 20): Question[] => {
  const pool = mode === QuizMode.QUESTION_RESPONSE ? [...qrTemplates] : [...scTemplates];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((t: any, i) => {
    const shuffledOptions = [...t.ans].sort(() => Math.random() - 0.5);
    
    if (mode === QuizMode.QUESTION_RESPONSE) {
      return {
        id: i,
        audioText: t.q,
        options: shuffledOptions,
        correctAnswer: t.correct,
        explanation: t.explain
      };
    } else {
      const parts: DialoguePart[] = [
        ...t.p.map((part: any) => ({ text: part.t, speaker: part.s })),
        { text: `Question: ${t.q}`, speaker: 2 }
      ];
      return {
        id: i,
        audioText: `${t.p.map((p:any) => p.t).join('. ')}. Question: ${t.q}`,
        dialogueParts: parts,
        questionText: t.q,
        options: shuffledOptions,
        correctAnswer: t.correct,
        explanation: t.explain
      };
    }
  });
};
