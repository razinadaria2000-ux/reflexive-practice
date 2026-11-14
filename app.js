const STORE = "reflexive-practice-v1";
const exercises = [
  {id:"facts",title:"Факт или интерпретация?",category:"Самонаблюдение",goal:"Научиться отделять наблюдаемые события от собственных объяснений.",steps:["Запишите, что именно произошло, без оценочных слов.","Отдельно запишите, какое значение вы придали ситуации.","Подумайте, какие ещё объяснения возможны."],prompt:"Какие детали вы наблюдали непосредственно, а какие добавили в виде предположений?"},
  {id:"chain",title:"Эмоция — мысль — импульс — действие",category:"Эмоциональная рефлексия",goal:"Проследить последовательность собственной реакции.",steps:["Назовите возникшую эмоцию и её интенсивность.","Запишите мысль, которая возникла в этот момент.","Отметьте импульс или желание.","Опишите, что вы фактически сделали."],prompt:"На каком этапе у вас появлялась возможность выбрать другой способ действия?"},
  {id:"triggers",title:"Мои личные триггеры",category:"Личные триггеры",goal:"Исследовать ситуации, которые особенно сильно затрагивают психолога.",steps:["Опишите ситуацию, вызвавшую сильную реакцию.","Что именно в ней оказалось для вас чувствительным?","Встречались ли похожие ситуации раньше?","Что помогло бы вам сохранить профессиональную позицию?"],prompt:"Какая ваша потребность, ценность или ожидание могло быть затронуто?"},
  {id:"alternatives",title:"Альтернативные гипотезы",category:"Эмоциональная рефлексия",goal:"Расширить понимание ситуации и не фиксироваться на первом объяснении.",steps:["Сформулируйте первоначальное объяснение своей реакции.","Предложите минимум два альтернативных объяснения.","Какие факты поддерживают каждую версию?","Что пока остаётся неизвестным?"],prompt:"Какие данные помогли бы различить предложенные объяснения?"},
  {id:"boundaries",title:"Профессиональные границы",category:"Профессиональные границы",goal:"Исследовать импульсы, связанные с ответственностью и границами роли психолога.",steps:["Опишите момент, когда захотелось сделать что-то за клиента или выйти за рамки своей роли.","Какую задачу вы пытались решить?","Что относится к ответственности клиента, а что — к вашей?","Как можно поддержать автономию клиента?"],prompt:"Какое действие одновременно учитывает интересы клиента и границы вашей профессиональной роли?"},
  {id:"supervision",title:"Подготовка к супервизии",category:"Супервизия",goal:"Перевести размышления в конкретные вопросы для профессионального обсуждения.",steps:["Кратко опишите эпизод.","Назовите свою реакцию и возможное влияние на работу.","Укажите, что вы пока не можете объяснить.","Сформулируйте 2–3 вопроса супервизору."],prompt:"Какой вопрос сейчас важнее всего обсудить с супервизором?"}
];
const initial = {
  entries:[], completions:[], notes:[], tree:{growth:0,streak:0,lastDay:null,branches:{}},
  demo:false
};
let state = load();
let currentPage = "home";
let activeExercise = null;
let lastAnalysis = null;

function load(){try{return {...initial,...JSON.parse(localStorage.getItem(STORE)||"{}")}}catch{return {...initial}}}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateLabel(d=new Date()){return new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(d)}
function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}
function setPage(page){currentPage=page;activeExercise=null;render()}
function nav(){document.querySelectorAll("[data-page]").forEach(b=>{b.classList.toggle("active",b.dataset.page===currentPage);b.onclick=()=>setPage(b.dataset.page)})}
function treeSvg(){const growth=Math.min(100,state.tree.growth);const leaves=Math.min(18,4+Math.floor(growth/7));let leafs="";for(let i=0;i<leaves;i++){const x=145+Math.sin(i*2.4)*((i%3)*17+22),y=95+((i*37)%145);leafs+=`<ellipse cx="${x}" cy="${y}" rx="11" ry="6" transform="rotate(${i*29} ${x} ${y})" fill="${i%3===0?"#9aaa83":"#718b6d"}" opacity=".9"/>`}
return `<svg viewBox="0 0 300 330" role="img" aria-label="Иллюстрация растущего дерева"><path d="M148 292 C139 245 158 213 145 174 C136 145 150 118 151 87 M148 202 C118 177 102 157 82 143 M149 175 C181 155 194 134 214 117 M146 225 C119 218 99 207 82 185 M153 205 C180 199 203 184 221 164" fill="none" stroke="#80674f" stroke-width="9" stroke-linecap="round"/>${leafs}<path d="M94 295 Q148 284 204 295" stroke="#b8a88b" stroke-width="3" fill="none"/><path d="M120 296 Q148 301 178 296" stroke="#d1c5ae" stroke-width="2" fill="none"/></svg>`}
function pageHeader(kicker,title,desc,action=""){return `<div class="hero"><div><div class="eyebrow">${kicker}</div><h1 class="page-title">${title}</h1><p class="lead">${desc}</p></div>${action?`<div>${action}</div>`:""}</div>`}
function render(){
  nav();
  const titles={home:"Обзор",diary:"Дневник реакций",reflection:"ИИ-рефлексия",practice:"Практикум",history:"История наблюдений",supervision:"Подготовка к супервизии",tree:"Моё дерево"};
  document.getElementById("crumb").textContent="Рабочее пространство / "+titles[currentPage];
  const content=document.getElementById("content");
  content.innerHTML=({home:homePage,diary:diaryPage,reflection:reflectionPage,practice:practicePage,history:historyPage,supervision:supervisionPage,tree:treePage}[currentPage])();
  if(innerWidth<=700) addMobileNav();
  bindPage();
}
function addMobileNav(){let old=document.querySelector(".mobile-nav");if(old)old.remove();let m=document.createElement("div");m.className="mobile-nav";m.innerHTML=[["home","⌂","Обзор"],["diary","▤","Дневник"],["practice","◇","Практикум"],["history","◷","История"],["tree","♧","Дерево"]].map(([p,i,t])=>`<button class="${currentPage===p?"active":""}" data-mpage="${p}"><span>${i}</span>${t}</button>`).join("");document.body.append(m);m.querySelectorAll("button").forEach(b=>b.onclick=()=>setPage(b.dataset.mpage))}
function homePage(){
 const today=state.completions.filter(c=>c.day===dayKey()).length;
 const streak=calcStreak();
 return `${pageHeader("ПРОСТРАНСТВО САМОНАБЛЮДЕНИЯ","Внимание к себе — часть профессиональной практики.","Здесь можно бережно исследовать свои реакции после консультации, замечать повторяющиеся темы и готовить вопросы для супервизии.",`<button class="btn btn-primary" data-go="diary">＋ Новая запись</button>`)}
 <div class="grid grid-4">
  <div class="card"><div class="stat-label">Записи в дневнике</div><div class="stat-value">${state.entries.length}</div><div class="stat-foot">За всё время</div></div>
  <div class="card"><div class="stat-label">Завершённые практики</div><div class="stat-value">${state.completions.length}</div><div class="stat-foot">Упражнения и рефлексия</div></div>
  <div class="card"><div class="stat-label">Активность сегодня</div><div class="stat-value">${today}</div><div class="stat-foot">Завершённых практик</div></div>
  <div class="card"><div class="stat-label">Дней подряд</div><div class="stat-value">${streak}</div><div class="stat-foot">Без оценок и соревнования</div></div>
 </div>
 <div class="section-head"><div><h2>С чего начать</h2><p>Выберите действие, которое сейчас подходит</p></div></div>
 <div class="grid grid-2">
  <div class="card quick-card" data-go="diary"><div class="quick-icon">▤</div><div><h3>Зафиксировать реакцию</h3><p>Опишите эпизод консультации, чувства, мысли, телесные реакции и импульсы.</p></div></div>
  <div class="card quick-card" data-go="reflection"><div class="quick-icon">✧</div><div><h3>Исследовать ситуацию</h3><p>Посмотрите на реакцию с разных сторон и рассмотрите альтернативные гипотезы.</p></div></div>
  <div class="card quick-card" data-go="practice"><div class="quick-icon">◇</div><div><h3>Выполнить упражнение</h3><p>Используйте короткие практики для структурирования самонаблюдения.</p></div></div>
  <div class="card quick-card" data-go="supervision"><div class="quick-icon">☷</div><div><h3>Подготовиться к супервизии</h3><p>Соберите наблюдения и сформулируйте вопросы для обсуждения.</p></div></div>
 </div>
 <div class="notice"><span>ⓘ</span><div><b>Важное напоминание.</b> Приложение помогает организовать самонаблюдение, но не определяет наличие контрпереноса и не заменяет профессиональную супервизию. Не вводите имена и другие идентифицирующие сведения клиентов.</div></div>
 <div class="section-head"><div><h2>Ваше дерево</h2><p>Оно растёт вместе с завершёнными практиками</p></div><button class="btn btn-secondary" data-go="tree">Посмотреть</button></div>
 <div class="card" style="display:flex;align-items:center;gap:20px"><div style="font-size:42px">♧</div><div style="flex:1"><strong style="font:700 14px Manrope">Продолжайте в своём темпе</strong><p class="muted" style="font-size:11px;margin:5px 0">Накопленный рост сохраняется. Активность не является показателем профессиональной компетентности.</p><div class="progress"><span style="width:${Math.min(100,state.tree.growth)}%"></span></div></div></div>`;
}
function diaryPage(){
 return `${pageHeader("ДНЕВНИК РЕАКЦИЙ","Что произошло во время консультации?","Начните с описания конкретного эпизода. На этом этапе важно заметить и зафиксировать реакцию, не торопясь объяснять её причины.")}
 <div class="card form-card"><form id="diaryForm"><div class="form-grid">
 <div class="field full"><label>Краткое название эпизода</label><input name="title" required placeholder="Например: раздражение, когда клиент сменил тему"></div>
 <div class="field full"><label>Контекст и описание ситуации</label><textarea name="situation" required placeholder="Что происходило? Описывайте ситуацию без имён и идентифицирующих деталей клиента."></textarea></div>
 <div class="field"><label>Какие чувства возникли?</label><textarea name="feelings" placeholder="Например: раздражение, тревога, растерянность..."></textarea></div>
 <div class="field"><label>Мысли о клиенте, себе или консультации</label><textarea name="thoughts" placeholder="Какие мысли возникли в тот момент?"></textarea></div>
 <div class="field"><label>Телесные реакции</label><textarea name="body" placeholder="Напряжение, учащённое сердцебиение, усталость..."></textarea></div>
 <div class="field"><label>Импульсы и желания</label><textarea name="impulses" placeholder="Что хотелось сделать или сказать?"></textarea></div>
 <div class="field full"><label>Что вы фактически сделали?</label><textarea name="actions" placeholder="Опишите свои действия и слова."></textarea></div>
 <div class="field full"><label>Как реакция могла повлиять на консультацию?</label><textarea name="impact" placeholder="Если пока сложно ответить, можно оставить поле пустым."></textarea></div>
 <div class="field full"><label>Интенсивность переживания <span id="intensityValue">5</span>/10</label><div class="range-row"><input type="range" name="intensity" min="1" max="10" value="5" id="intensity"><span class="range-number" id="intensityNumber">5</span></div></div>
 </div><div class="form-actions"><button class="btn btn-primary" type="submit">Сохранить запись</button><button class="btn btn-ghost" type="reset">Очистить форму</button></div></form></div>
 <div class="section-head"><div><h2>Последние записи</h2><p>Сохранённые наблюдения в этом браузере</p></div><button class="btn btn-secondary" data-go="history">Вся история</button></div>
 ${entryList(state.entries.slice(0,3))}`;
}
function entryList(items){if(!items.length)return `<div class="empty"><strong>Пока нет записей</strong>Добавленные наблюдения появятся здесь.</div>`;return `<div class="entry-list">${items.map(e=>`<div class="entry"><div><h3>${esc(e.title)}</h3><p>${esc(e.situation).slice(0,190)}${e.situation.length>190?"…":""}</p><div class="entry-meta">${dateLabel(new Date(e.created))} · Интенсивность: ${e.intensity}/10</div></div><div class="entry-actions"><button class="btn btn-secondary" data-entry-reflect="${e.id}">Исследовать</button> <button class="btn btn-ghost" data-delete="${e.id}">Удалить</button></div></div>`).join("")}</div>`}
function reflectionPage(){
 const selected=state.entries.find(e=>e.id===document.body.dataset.reflectEntry)||state.entries[0];
 return `${pageHeader("ИИ-РЕФЛЕКСИЯ","Посмотреть на реакцию с разных сторон","Рефлексивный помощник помогает структурировать размышления и предлагает гипотезы, а не диагнозы.")}
 <div class="card form-card"><div class="field"><label>Выберите запись из дневника</label><select id="reflectionEntry">${state.entries.map(e=>`<option value="${e.id}" ${selected&&e.id===selected.id?"selected":""}>${esc(e.title)} · ${dateLabel(new Date(e.created))}</option>`).join("")}</select></div>
 ${state.entries.length?`<div class="notice"><span>✧</span><div>Демонстрационный анализ использует заранее заданную логику вопросов и гипотез. Подключение внешней языковой модели пока не выполнено.</div></div><div class="form-actions"><button class="btn btn-primary" id="analyzeBtn">Сформировать рефлексивный разбор</button></div><div id="analysisOutput">${lastAnalysis||""}</div>`:`<div class="empty" style="margin-top:17px"><strong>Сначала нужна запись</strong>Заполните дневник реакций, чтобы исследовать конкретный эпизод.<br><br><button class="btn btn-primary" data-go="diary">Перейти в дневник</button></div>`}
 </div>
 <div class="notice"><span>ⓘ</span><div>Предлагаемые объяснения являются возможными направлениями исследования. Вы можете не согласиться с ними. Окончательные выводы формулируете вы сами, при необходимости — вместе с супервизором.</div></div>`;
}
function makeAnalysis(e){
 const emotion=e.feelings||"описанное переживание";
 const thought=e.thoughts||"мысли в ситуации";
 const impulse=e.impulses||"поведенческий импульс";
 const text=`<div class="result-box"><div class="eyebrow">ДЕМОНСТРАЦИОННЫЙ РЕФЛЕКСИВНЫЙ РАЗБОР</div><h3>1. Что удалось заметить</h3><p><b>Переживания:</b> ${esc(emotion)}</p><p><b>Мысли:</b> ${esc(thought)}</p><p><b>Импульсы:</b> ${esc(impulse)}</p><p><b>Интенсивность:</b> ${e.intensity}/10</p><hr class="divider"><h3>2. Возможные направления исследования</h3>
 <div class="hypothesis"><strong>Гипотеза 1. Личные ожидания</strong>Возможно, в ситуации затронулось ваше ожидание относительно того, как должна проходить консультация или как быстро должны появляться изменения. Что именно вы ожидали от себя или клиента?</div>
 <div class="hypothesis"><strong>Гипотеза 2. Ситуативные факторы</strong>На реакцию могли повлиять усталость, напряжение, ограничение времени или особенности конкретного эпизода. Что происходило с вами до консультации и в её ходе?</div>
 <div class="hypothesis"><strong>Гипотеза 3. Профессиональная позиция и границы</strong>Возможно, реакция связана с переживанием ответственности за результат или желанием повлиять на выбор клиента. Какая часть ситуации относилась к вашей ответственности, а какая — к ответственности клиента?</div>
 <hr class="divider"><h3>3. Вопросы для дальнейшей рефлексии</h3><ol><li>Какие факты эпизода вы можете отделить от собственных интерпретаций?</li><li>Что именно в поведении клиента или ходе консультации вызвало наиболее сильную реакцию?</li><li>Как эта реакция могла повлиять на ваши слова, решения или внимание?</li><li>Какие альтернативные объяснения ситуации вы можете предложить?</li></ol>
 <h3>4. Возможный следующий шаг</h3><p>Попробуйте упражнение «Факт или интерпретация?» или «Эмоция — мысль — импульс — действие». Если реакция заметно повлияла на консультацию или продолжает вас беспокоить, вынесите этот эпизод на супервизию.</p>
 <label class="checkline"><input type="checkbox" id="analysisAccepted"> Я рассмотрел(а) предложенные гипотезы и самостоятельно определю, какие из них мне подходят.</label>
 <div class="form-actions"><button class="btn btn-secondary" data-go="practice">Перейти к упражнениям</button><button class="btn btn-ghost" data-go="supervision">Подготовить супервизию</button></div></div>`;
 return text;
}
function practicePage(){
 if(activeExercise){const ex=exercises.find(x=>x.id===activeExercise);return `${pageHeader("ПРАКТИКУМ",ex.title,ex.goal)}<div class="card form-card"><div class="eyebrow">${ex.category}</div><h3 style="font:700 15px Manrope">Последовательность выполнения</h3><ol>${ex.steps.map(s=>`<li style="margin:9px 0;line-height:1.6">${s}</li>`).join("")}</ol><form id="exerciseForm"><div class="field"><label>Ваши заметки и ответы</label><textarea name="answer" required style="min-height:180px" placeholder="Запишите свои размышления..."></textarea></div><div class="notice"><span>✧</span><div>${ex.prompt}</div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Завершить практику</button><button class="btn btn-ghost" type="button" id="backExercises">Назад к упражнениям</button></div></form></div>`}
 return `${pageHeader("ПРАКТИКУМ","Небольшие шаги к пониманию своих реакций","Выберите упражнение. Его можно выполнить сразу после консультации или вернуться к нему позднее.")}
 <div class="grid grid-2">${exercises.map(ex=>`<div class="card exercise-card"><span class="tag">${ex.category}</span><h3>${ex.title}</h3><p>${ex.goal}</p><button class="btn btn-secondary" data-exercise="${ex.id}">Начать упражнение →</button></div>`).join("")}</div>
 <div class="notice"><span>ⓘ</span><div>Упражнения предназначены для рефлексии и самонаблюдения. Они не являются психодиагностическими методиками и не дают клинических заключений.</div></div>`;
}
function historyPage(){return `${pageHeader("ИСТОРИЯ","Ваши наблюдения","Возвращайтесь к записям, отмечайте повторяющиеся темы и фиксируйте выводы после супервизии.",`<button class="btn btn-primary" data-go="diary">＋ Новая запись</button>`)}
 <div class="grid grid-4"><div class="card"><div class="stat-label">Записей</div><div class="stat-value">${state.entries.length}</div></div><div class="card"><div class="stat-label">Упражнений</div><div class="stat-value">${state.completions.length}</div></div><div class="card"><div class="stat-label">Супервизионных заметок</div><div class="stat-value">${state.notes.length}</div></div><div class="card"><div class="stat-label">Накопленный рост дерева</div><div class="stat-value">${state.tree.growth}</div></div></div>
 <div class="section-head"><div><h2>Дневник реакций</h2><p>Записи сохраняются локально в вашем браузере</p></div><input id="historySearch" placeholder="Поиск по записям..." style="max-width:220px;border:1px solid var(--line);border-radius:8px;padding:9px 11px;background:#fffefa"></div>
 <div id="historyEntries">${entryList(state.entries)}</div>
 <div class="section-head"><div><h2>Завершённые практики</h2><p>История выполненных упражнений</p></div></div>
 ${state.completions.length?`<div class="entry-list">${[...state.completions].reverse().map(c=>`<div class="entry"><div><h3>${esc(c.title)}</h3><p>${esc(c.answer).slice(0,180)}</p><div class="entry-meta">${dateLabel(new Date(c.created))}</div></div><span class="tag">${esc(c.category)}</span></div>`).join("")}</div>`:`<div class="empty">Пока нет завершённых упражнений.</div>`}
 <div class="form-actions"><button class="btn btn-ghost" id="exportData">Экспортировать мои данные (JSON)</button></div>`;
}
function supervisionPage(){
 const e=state.entries[0];
 return `${pageHeader("ПРОФЕССИОНАЛЬНОЕ ОБСУЖДЕНИЕ","Подготовка к супервизии","Соберите наблюдения в структурированный материал. Итоговый текст можно редактировать, копировать и использовать для подготовки к встрече.")}
 <div class="card form-card"><form id="supervisionForm"><div class="field"><label>Эпизод консультации</label><textarea name="episode" id="supEpisode" placeholder="Кратко опишите ситуацию без идентифицирующих сведений клиента.">${e?esc(e.situation):""}</textarea></div><div class="field" style="margin-top:14px"><label>Мои эмоциональные реакции</label><textarea name="feelings" id="supFeelings">${e?esc(e.feelings):""}</textarea></div><div class="field" style="margin-top:14px"><label>Мысли и импульсы</label><textarea name="thoughts" id="supThoughts">${e?esc([e.thoughts,e.impulses].filter(Boolean).join("\n")):""}</textarea></div><div class="field" style="margin-top:14px"><label>Мои действия и возможное влияние на консультацию</label><textarea name="actions" id="supActions">${e?esc([e.actions,e.impact].filter(Boolean).join("\n")):""}</textarea></div><div class="field" style="margin-top:14px"><label>Альтернативные объяснения</label><textarea name="alternatives" placeholder="Какие ещё факторы могли повлиять на мою реакцию?"></textarea></div><div class="field" style="margin-top:14px"><label>Вопросы супервизору</label><textarea name="questions" required placeholder="1. Что я пока не учитываю в этой ситуации?&#10;2. Как моя реакция могла повлиять на процесс?"></textarea></div><div class="form-actions"><button class="btn btn-primary" type="submit">Сохранить материал</button><button class="btn btn-secondary" type="button" id="copySup">Копировать текст</button><button class="btn btn-ghost" type="button" id="printSup">Печать</button></div></form></div>
 <div class="section-head"><div><h2>Сохранённые материалы</h2><p>Только ваши заметки</p></div></div>${state.notes.length?`<div class="entry-list">${[...state.notes].reverse().map(n=>`<div class="entry"><div><h3>Материал для супервизии</h3><p>${esc(n.episode).slice(0,160)}</p><div class="entry-meta">${dateLabel(new Date(n.created))}</div></div><button class="btn btn-ghost" data-delete-note="${n.id}">Удалить</button></div>`).join("")}</div>`:`<div class="empty">Сохранённых материалов пока нет.</div>`}`;
}
function calcStreak(){const days=[...new Set(state.completions.map(c=>c.day))].sort().reverse();if(!days.length)return 0;let d=new Date();let today=dayKey(d);if(days[0]!==today){d.setDate(d.getDate()-1);if(days[0]!==dayKey(d))return 0}let n=0;for(let i=0;i<days.length;i++){let x=new Date();x.setDate(x.getDate()-i);if(days.includes(dayKey(x)))n++;else break}return n}
function treePage(){const streak=calcStreak();return `${pageHeader("ЖИВОЕ ДЕРЕВО","Ваш путь рефлексии","Дерево отражает завершённые практики и накопленную активность. Это метафора процесса, а не оценка ваших профессиональных качеств.")}
 <div class="tree-wrap"><div class="tree-stage">${treeSvg()}</div><div><div class="eyebrow">ВАШ ПРОГРЕСС</div><h2 style="font:700 21px Manrope;margin:0 0 8px">Каждая практика — новый рост</h2><p class="lead" style="font-size:12px">Короткая практика добавляет 3 единицы роста, полноценная — 8. Дневной прирост ограничен. Накопленный рост не исчезает.</p><div class="tree-stats"><div class="tree-stat"><strong>${state.tree.growth}</strong><small>Единиц роста</small></div><div class="tree-stat"><strong>${streak}</strong><small>Дней активности подряд</small></div><div class="tree-stat"><strong>${state.completions.length}</strong><small>Завершённых практик</small></div><div class="tree-stat"><strong>${Object.keys(state.tree.branches||{}).length}</strong><small>Развитых направлений</small></div></div><div class="stat-label">Следующий визуальный этап</div><div class="progress"><span style="width:${state.tree.growth%100}%"></span></div><p class="stat-foot">${100-(state.tree.growth%100)} единиц до следующего этапа визуального роста</p></div></div>
 <div class="section-head"><div><h2>Ветви практики</h2><p>Развиваются при завершении соответствующих упражнений</p></div></div>
 <div class="grid grid-2">${["Самонаблюдение","Эмоциональная рефлексия","Личные триггеры","Профессиональные границы","Супервизия"].map(cat=>`<div class="card"><div style="display:flex;justify-content:space-between"><strong style="font:700 12px Manrope">${cat}</strong><span style="color:var(--green-dark)">♧ ${state.tree.branches?.[cat]||0}</span></div><div class="progress"><span style="width:${Math.min(100,(state.tree.branches?.[cat]||0)*12)}%"></span></div></div>`).join("")}</div>
 <div class="notice"><span>♡</span><div>Пропуск дней не отменяет уже проделанную работу. Возвращаться к практике можно в удобном для вас темпе.</div></div>`}
function bindPage(){
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>setPage(b.dataset.go));
 document.querySelectorAll("[data-entry-reflect]").forEach(b=>b.onclick=()=>{document.body.dataset.reflectEntry=b.dataset.entryReflect;lastAnalysis="";setPage("reflection")});
 document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Удалить эту запись?")){state.entries=state.entries.filter(e=>e.id!==b.dataset.delete);save();render();toast("Запись удалена")}})
 document.querySelectorAll("[data-delete-note]").forEach(b=>b.onclick=()=>{state.notes=state.notes.filter(n=>n.id!==b.dataset.deleteNote);save();render()});
 const intensity=document.getElementById("intensity");if(intensity)intensity.oninput=()=>{document.getElementById("intensityNumber").textContent=intensity.value;document.getElementById("intensityValue").textContent=intensity.value};
 const df=document.getElementById("diaryForm");if(df)df.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(df));state.entries.unshift({id:crypto.randomUUID(),...d,intensity:Number(d.intensity),created:new Date().toISOString()});save();df.reset();render();toast("Запись сохранена")};
 const ab=document.getElementById("analyzeBtn");if(ab)ab.onclick=()=>{const id=document.getElementById("reflectionEntry").value;const e=state.entries.find(x=>x.id===id);lastAnalysis=makeAnalysis(e);document.getElementById("analysisOutput").innerHTML=lastAnalysis;};
 document.querySelectorAll("[data-exercise]").forEach(b=>b.onclick=()=>{activeExercise=b.dataset.exercise;render()});
 const back=document.getElementById("backExercises");if(back)back.onclick=()=>{activeExercise=null;render()};
 const ef=document.getElementById("exerciseForm");if(ef)ef.onsubmit=e=>{e.preventDefault();const ex=exercises.find(x=>x.id===activeExercise);const answer=new FormData(ef).get("answer");completePractice(ex,answer,3);activeExercise=null;render();toast("Практика завершена, дерево выросло")};
 const search=document.getElementById("historySearch");if(search)search.oninput=()=>{const q=search.value.toLowerCase();document.getElementById("historyEntries").innerHTML=entryList(state.entries.filter(e=>(e.title+" "+e.situation+" "+e.feelings).toLowerCase().includes(q)))};
 const exp=document.getElementById("exportData");if(exp)exp.onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="reflexive-practice-data.json";a.click();URL.revokeObjectURL(a.href)};
 const sf=document.getElementById("supervisionForm");if(sf)sf.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(sf));state.notes.push({id:crypto.randomUUID(),...d,created:new Date().toISOString()});save();render();toast("Материал для супервизии сохранён")};
 const cp=document.getElementById("copySup");if(cp)cp.onclick=()=>{const f=document.getElementById("supervisionForm");const d=Object.fromEntries(new FormData(f));const text=Object.entries(d).map(([k,v])=>v).join("\n\n");navigator.clipboard.writeText(text).then(()=>toast("Текст скопирован")).catch(()=>toast("Не удалось скопировать — используйте печать"))};
 const pr=document.getElementById("printSup");if(pr)pr.onclick=()=>window.print();
}
function completePractice(ex,answer,points){const today=dayKey();const already=state.completions.filter(c=>c.day===today).reduce((s,c)=>s+c.points,0);const earned=Math.min(points,Math.max(0,8-already));state.completions.push({id:crypto.randomUUID(),title:ex.title,category:ex.category,answer,created:new Date().toISOString(),day:today,points:earned});state.tree.growth+=earned;state.tree.branches=state.tree.branches||{};state.tree.branches[ex.category]=(state.tree.branches[ex.category]||0)+1;save()}
document.getElementById("resetDemo").onclick=()=>{if(confirm("Удалить все локальные записи и сбросить прогресс дерева? Это действие нельзя отменить.")){state={...initial,tree:{...initial.tree,branches:{}}};save();render();toast("Локальные данные сброшены")}};
render();

if ("serviceWorker" in navigator && location.protocol !== "file:") { window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{})); }
