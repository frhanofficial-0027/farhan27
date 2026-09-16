const $ = s => document.querySelector(s);

const typeText = $("#typeText");
const phrase = "Hey ! This is";
let typeIndex = 0;
function typeWriter(){
  if(typeIndex <= phrase.length){
    typeText.textContent = phrase.slice(0,typeIndex++);
    setTimeout(typeWriter, 90);
  }
}
typeWriter();

const nameModal=$("#nameModal"), gameOverModal=$("#gameOverModal");
const nameInput=$("#nameInput"), playerName=$("#playerName");
const scoreEl=$("#score"), gameScore=$("#gameScore"), bestScore=$("#bestScore");
const road=$("#road"), car=$("#car"), obstacles=$("#obstacles");
const roadMessage=$("#roadMessage"), startBtn=$("#startBtn");
const leftBtn=$("#leftBtn"), rightBtn=$("#rightBtn");
const pauseBtn=$("#pauseBtn"), pauseMini=$("#pauseMini");
const beginBtn=$("#beginBtn"), closeModal=$("#closeModal"), againBtn=$("#againBtn");

let player="GUEST", lane=1, score=0, best=Number(localStorage.getItem("farhanBest")||0);
let running=false, paused=false, last=0, spawnTimer=0, speed=185, raf=0;
bestScore.textContent=String(best).padStart(4,"0");

function updateScore(){
  const s=String(Math.floor(score)).padStart(4,"0");
  scoreEl.textContent=s; gameScore.textContent=s;
}
function setLane(next){
  lane=Math.max(0,Math.min(2,next));
  car.style.left=(33 + lane*17)+"%";
}
function move(dir){ if(running && !paused) setLane(lane+dir); }

function openName(){
  nameModal.classList.add("show");
  nameInput.focus();
}
function resetRoad(){
  obstacles.innerHTML="";
  score=0; speed=185; spawnTimer=0; paused=false; running=false;
  updateScore(); setLane(1);
  roadMessage.style.display="grid";
  roadMessage.textContent="PRESS ENTER GAME";
  pauseBtn.disabled=true; pauseMini.disabled=true;
}
function startGame(){
  running=true; paused=false; score=0; speed=185; spawnTimer=0;
  updateScore(); roadMessage.style.display="none";
  pauseBtn.disabled=false; pauseMini.disabled=false;
  pauseBtn.textContent="Ⅱ  PAUSE";
  last=performance.now();
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(loop);
}
function spawnObstacle(){
  const o=document.createElement("div");
  o.className="obstacle";
  o.textContent=["🚕","🚙","🚘"][Math.floor(Math.random()*3)];
  o.dataset.lane=Math.floor(Math.random()*3);
  o.style.left=(24 + Number(o.dataset.lane)*17)+"%";
  o.style.top="-60px";
  obstacles.appendChild(o);
}
function collision(a,b){
  const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
  return ar.left<br.right-10 && ar.right>br.left+10 && ar.top<br.bottom-12 && ar.bottom>br.top+12;
}
function endGame(){
  running=false; cancelAnimationFrame(raf);
  pauseBtn.disabled=true; pauseMini.disabled=true;
  const final=Math.floor(score);
  if(final>best){
    best=final; localStorage.setItem("farhanBest",best);
    bestScore.textContent=String(best).padStart(4,"0");
  }
  $("#finalName").textContent=player;
  $("#finalScore").textContent=String(final).padStart(4,"0");
  gameOverModal.classList.add("show");
}
function loop(now){
  if(!running)return;
  const dt=Math.min((now-last)/1000,.04); last=now;
  if(!paused){
    score += dt*12;
    speed += dt*2.2;
    spawnTimer += dt;
    if(spawnTimer > Math.max(.48,1.05-score/700)){
      spawnTimer=0; spawnObstacle();
    }
    document.querySelectorAll(".obstacle").forEach(o=>{
      const y=(parseFloat(o.style.top)||-60)+speed*dt;
      o.style.top=y+"px";
      if(y>road.clientHeight+70)o.remove();
      else if(collision(car,o)) endGame();
    });
    updateScore();
  }
  raf=requestAnimationFrame(loop);
}

startBtn.addEventListener("click",openName);
beginBtn.addEventListener("click",()=>{
  player=(nameInput.value.trim()||"GUEST").slice(0,18);
  playerName.textContent=player.toUpperCase();
  nameModal.classList.remove("show");
  startGame();
});
againBtn.addEventListener("click",()=>{
  gameOverModal.classList.remove("show");
  startGame();
});
closeModal.addEventListener("click",()=>nameModal.classList.remove("show"));
leftBtn.addEventListener("click",()=>move(-1));
rightBtn.addEventListener("click",()=>move(1));
pauseBtn.addEventListener("click",togglePause);
pauseMini.addEventListener("click",togglePause);

function togglePause(){
  if(!running)return;
  paused=!paused;
  pauseBtn.textContent=paused?"▶  RESUME":"Ⅱ  PAUSE";
  roadMessage.style.display=paused?"grid":"none";
  roadMessage.textContent=paused?"PAUSED":"";
}
document.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){e.preventDefault();move(-1)}
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){e.preventDefault();move(1)}
  if(e.key.toLowerCase()==="p")togglePause();
  if(e.key==="Enter" && !running && !nameModal.classList.contains("show") && !gameOverModal.classList.contains("show"))openName();
});
let touchX=0;
road.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].clientX},{passive:true});
road.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-touchX;
  if(Math.abs(dx)>25) move(dx>0?1:-1);
},{passive:true});

window.addEventListener("blur",()=>{if(running&&!paused)togglePause()});
