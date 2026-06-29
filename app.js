import { firebaseConfig, GEMINI_API_KEY } from 'firebase-config.js';

const courses = [
  { id:'uiux', icon:'🎨', title:'UI/UX Designer', modules:['Design basics','Wireframe','Prototype','Figma workflow','Portfolio project'] },
  { id:'frontend', icon:'🌐', title:'Frontend Developer', modules:['HTML','CSS','JavaScript','Responsive UI','Mini projects'] },
  { id:'fullstack', icon:'💻', title:'Full Stack Developer', modules:['Frontend','Backend concept','Database','API','Final app'] },
  { id:'javascript', icon:'⚡', title:'JavaScript Mastery', modules:['Variables','Functions','DOM','Events','LocalStorage'] },
  { id:'firebase', icon:'🔥', title:'Firebase Developer', modules:['Auth','Firestore','Hosting','Security rules','Project deploy'] },
  { id:'github', icon:'🐙', title:'Git & GitHub', modules:['Git basics','Repository','Commit','Pages','Team workflow'] }
];

const quizQuestions = [
  { q:'Which language is used for webpage structure?', options:['CSS','HTML','Firebase'], ans:'HTML' },
  { q:'Which tool is popular for UI/UX prototype?', options:['Figma','Node.js','MongoDB'], ans:'Figma' },
  { q:'Which service can provide Google Login?', options:['Firebase Auth','CSS','VS Code'], ans:'Firebase Auth' }
];

let currentUser = JSON.parse(localStorage.getItem('ai_user')) || null;
let progress = JSON.parse(localStorage.getItem('ai_progress')) || {};

const $ = id => document.getElementById(id);

function init(){
  renderCourses();
  renderCourseSelect();
  renderQuiz();
  updateUserUI();
  addBotMessage('Vanakkam! Course select panni doubt kekkalam. Demo mode-la naan offline AI teacher madhiri answer kuduppen.');

  $('loginBtn').addEventListener('click', googleLoginDemo);
  $('logoutBtn').addEventListener('click', logout);
  $('themeBtn').addEventListener('click', toggleTheme);
  $('askBtn').addEventListener('click', askAI);
  $('runBtn').addEventListener('click', runCode);
  $('submitQuiz').addEventListener('click', submitQuiz);
  $('certificateBtn').addEventListener('click', downloadCertificate);

  $('htmlCode').value = '<h1>Hello AI Skill Academy</h1>\n<button onclick="sayHi()">Click Me</button>';
  $('cssCode').value = 'body{font-family:Arial;text-align:center;padding:40px;}\nh1{color:#6c63ff;}\nbutton{padding:12px 20px;border:0;border-radius:10px;background:#6c63ff;color:white;}';
  $('jsCode').value = 'function sayHi(){ alert("Great! Your code is working."); }';
}

function renderCourses(){
  $('courseGrid').innerHTML = courses.map(course => `
    <div class="course-card">
      <div class="icon">${course.icon}</div>
      <h3>${course.title}</h3>
      <ul>${course.modules.map(m=>`<li>${m}</li>`).join('')}</ul>
      <button class="primary" onclick="window.selectCourse('${course.id}')">Start Course</button>
    </div>
  `).join('');
}

window.selectCourse = function(id){
  $('courseSelect').value = id;
  progress[id] = Math.min((progress[id] || 0) + 20, 100);
  saveProgress();
  const c = courses.find(x=>x.id===id);
  addBotMessage(`${c.title} start pannalam. First lesson: ${c.modules[0]}. Naan step-by-step explain pannuren.`);
  location.hash = 'ai-teacher';
}

function renderCourseSelect(){
  $('courseSelect').innerHTML = courses.map(c=>`<option value="${c.id}">${c.icon} ${c.title}</option>`).join('');
}

function updateUserUI(){
  if(currentUser){
    $('userName').textContent = currentUser.name;
    $('userEmail').textContent = currentUser.email;
    $('loginBtn').classList.add('hidden');
    $('logoutBtn').classList.remove('hidden');
  }else{
    $('userName').textContent = 'Guest Student';
    $('userEmail').textContent = 'Login to save progress';
    $('loginBtn').classList.remove('hidden');
    $('logoutBtn').classList.add('hidden');
  }
  const total = courses.reduce((sum,c)=>sum+(progress[c.id]||0),0);
  const percent = Math.round(total / courses.length);
  $('totalProgress').style.width = percent + '%';
  $('progressText').textContent = percent + '% completed';
}

function googleLoginDemo(){
  // Demo login. For real Google Login, add Firebase SDK and config.
  const name = prompt('Enter your name for demo login:') || 'Student';
  currentUser = { name, email: name.toLowerCase().replaceAll(' ','') + '@gmail.com' };
  localStorage.setItem('ai_user', JSON.stringify(currentUser));
  updateUserUI();
  addBotMessage('Login success! Real Google Login-ku Firebase config add pannunga.');
}

function logout(){
  currentUser = null;
  localStorage.removeItem('ai_user');
  updateUserUI();
}

function toggleTheme(){
  document.body.classList.toggle('light');
  $('themeBtn').textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
}

function addBotMessage(text){ addMessage(text, 'bot'); }
function addUserMessage(text){ addMessage(text, 'user'); }
function addMessage(text,type){
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = text;
  $('chatBox').appendChild(div);
  $('chatBox').scrollTop = $('chatBox').scrollHeight;
}

async function askAI(){
  const question = $('questionInput').value.trim();
  if(!question) return;
  const course = courses.find(c=>c.id===$('courseSelect').value);
  addUserMessage(question);
  $('questionInput').value='';

  if(GEMINI_API_KEY){
    try{
      const reply = await askGemini(`${course.title} course teacher madhiri simple Tamil-English mix-la explain pannu: ${question}`);
      addBotMessage(reply);
      return;
    }catch(e){
      addBotMessage('Gemini API error. Demo answer show pannuren. API key/config check pannunga.');
    }
  }

  const reply = demoAIReply(course, question);
  addBotMessage(reply);
}

function demoAIReply(course, question){
  const q = question.toLowerCase();
  if(q.includes('project')) return `${course.title} project idea: Login page, dashboard, CRUD page, quiz and final portfolio create pannunga. First UI design, then HTML/CSS, then JavaScript logic.`;
  if(q.includes('error')) return `Error fix steps: 1) Console open pannunga 2) spelling/id check pannunga 3) script.js link correct-a irukka check pannunga 4) Firebase config correct-a irukka check pannunga.`;
  if(q.includes('lesson') || q.includes('explain')) return `${course.title} lesson: Basic concept understand pannunga, small example practice pannunga, aprom mini project build pannunga. Naan simple task kudukkuren: ${course.modules[0]} related one small page create pannunga.`;
  return `${course.title} course-ku answer: ${question}. Simple-a start pannunga: concept → example → practice → project → quiz → certificate.`;
}

async function askGemini(prompt){
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
}

function runCode(){
  const code = `${$('htmlCode').value}<style>${$('cssCode').value}</style><script>${$('jsCode').value}<\/script>`;
  $('output').srcdoc = code;
}

function renderQuiz(){
  $('quizBox').innerHTML = quizQuestions.map((item,i)=>`
    <div class="quiz-item">
      <h3>${i+1}. ${item.q}</h3>
      ${item.options.map(o=>`<label class="quiz-option"><input type="radio" name="q${i}" value="${o}"> ${o}</label>`).join('')}
    </div>
  `).join('');
}

function submitQuiz(){
  let score = 0;
  quizQuestions.forEach((item,i)=>{
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if(selected && selected.value === item.ans) score++;
  });
  $('quizResult').textContent = `Your Score: ${score}/${quizQuestions.length}`;
  if(score === quizQuestions.length){
    progress.quiz = 100;
    saveProgress();
  }
}

function saveProgress(){
  localStorage.setItem('ai_progress', JSON.stringify(progress));
  updateUserUI();
}

function downloadCertificate(){
  const name = $('certName').value.trim() || currentUser?.name || 'Student';
  const course = courses.find(c=>c.id===$('courseSelect').value)?.title || 'AI Skill Course';
  const html = `
  <html><head><title>Certificate</title><style>
  body{font-family:Georgia,serif;text-align:center;padding:60px;background:#f8f4e8;color:#222}.box{border:10px solid #6c63ff;padding:50px}h1{font-size:46px;color:#6c63ff}.name{font-size:38px;font-weight:bold}.course{font-size:26px}</style></head>
  <body><div class="box"><h1>Certificate of Completion</h1><p>This certificate is proudly presented to</p><p class="name">${name}</p><p>for completing</p><p class="course">${course}</p><p>AI Skill Academy</p><p>${new Date().toLocaleDateString()}</p></div><script>window.print()<\/script></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html); w.document.close();
}

init();
