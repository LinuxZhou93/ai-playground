(function(){
  const KEY='xmp_seed_growth_demo_v1';
  const defaults={lessonStarted:false,tasks:[],observations:[],reportReady:false,updatedAt:null};
  const read=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}};
  const write=(patch)=>{const state={...read(),...patch,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new Event('xmp:update'));return state};
  const toast=(message)=>{let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)};
  window.XMP={read,write,toast,reset(){localStorage.removeItem(KEY);location.reload()}};
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-xmp-action]');if(!target)return;
    const action=target.dataset.xmpAction;const state=read();
    if(action==='start'){write({lessonStarted:true});toast('种子成长课堂已启动');target.textContent='课堂进行中'}
    if(action==='task'){const id=target.dataset.task;const tasks=[...new Set([...state.tasks,id])];write({tasks});target.textContent='已完成';target.disabled=true;toast('互动结果已记录')}
    if(action==='observe'){const value=target.dataset.value;const observations=[...new Set([...state.observations,value])];write({observations});target.classList.add('selected');toast('教师观察已保存')}
    if(action==='report'){write({reportReady:true});toast('成长报告已生成');setTimeout(()=>location.href='/xmp/dashboard',500)}
  });
  const sync=()=>{const s=read();document.querySelectorAll('[data-task]').forEach(el=>{if(s.tasks.includes(el.dataset.task)){el.textContent='已完成';el.disabled=true}});document.querySelectorAll('[data-value]').forEach(el=>{if(s.observations.includes(el.dataset.value))el.classList.add('selected')});document.querySelectorAll('[data-xmp-progress]').forEach(el=>{const score=(s.lessonStarted?25:0)+s.tasks.length*15+(s.observations.length?15:0)+(s.reportReady?15:0);el.textContent=Math.min(score,100)+'%'});document.querySelectorAll('[data-xmp-task-count]').forEach(el=>el.textContent=s.tasks.length);document.querySelectorAll('[data-xmp-observation-count]').forEach(el=>el.textContent=s.observations.length)};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',sync):sync();window.addEventListener('xmp:update',sync);
})();
