(function(){
'use strict';
var DAY=86400000;
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DEF={title:'Buildtober 2026',tagline:'',owner:{name:'Moo',org:'Kitsune Technologies',url:'https://kitsunetechnologies.org',github:'https://github.com/KitsuneTech1'},
  github_url:'https://github.com/KitsuneTech1/buildtober-site',start:'2026-10-01',end:'2026-10-31',timezone_offset:'-05:00'};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function $(id){return document.getElementById(id)}
function pad(n){return String(n).padStart(2,'0')}
function offMs(s){var m=/^([+-])(\d\d):?(\d\d)$/.exec(s||'');if(!m)return 0;return (m[1]==='-'?-1:1)*(+m[2]*60+ +m[3])*60000}
function isoDay(ms){return new Date(ms).toISOString().slice(0,10)}
function dayDiff(a,b){return Math.round((Date.parse(a)-Date.parse(b))/DAY)}
function pretty(iso){var p=iso.split('-');return MONTHS[+p[1]-1].slice(0,3)+' '+(+p[2])}
function img(d){return d.image||('img/'+(d.slug||'')+'.svg')}

var S,data,OFF,T0,T1;

function setup(j){
  data=j;S={};
  Object.keys(DEF).forEach(function(k){S[k]=j[k]!=null?j[k]:DEF[k]});
  S.owner=Object.assign({},DEF.owner,j.owner||{});
  OFF=offMs(S.timezone_offset);
  T0=Date.parse(S.start+'T00:00:00'+S.timezone_offset);
  T1=Date.parse(S.end+'T23:59:59'+S.timezone_offset)+1000;
  data.days.sort(function(a,b){return a.day<b.day?-1:a.day>b.day?1:a.slot-b.slot});
}

function pillFor(d,today){
  if(d.status==='shipped')return['shipped','shipped'];
  var n=dayDiff(d.day,today);
  if(n===0)return['today','today'];
  if(n<0)return['due','due'];
  return['',n===1?'tomorrow':'in '+n+' days'];
}
function pill(d,today){var p=pillFor(d,today);return el('span','pill '+p[0],p[1])}

function bindStatic(){
  var t=S.title,m=/^(.*?)\s*(\d{4})$/.exec(t);
  document.title=t+(S.tagline?': '+S.tagline.replace(/\.\s.*$/,''):'');
  var h=$('h1');h.textContent='';
  if(m){h.appendChild(document.createTextNode(m[1]+' '));h.appendChild(el('span',null,m[2]))}else h.textContent=t;
  document.querySelectorAll('[data-bind="title-short"]').forEach(function(n){n.textContent=m?m[1]:t});
  if(S.tagline)$('tagline').textContent=S.tagline;
  document.querySelectorAll('[data-bind="github"]').forEach(function(a){a.href=S.github_url});
  var o=S.owner;
  $('built').textContent='Built by '+o.name+(o.org?' at '+o.org:'');
  if(o.url){$('f-site').href=o.url;$('f-site').textContent=o.url.replace(/^https?:\/\//,'').replace(/\/$/,'')}
  if(o.github){$('f-gh').href=o.github;$('f-gh').textContent='GitHub: '+o.github.replace(/\/$/,'').split('/').pop()}
  $('forklink').href=S.github_url+'#use-it-yourself';
  $('f-lic').href=S.github_url+'/blob/main/LICENSE';
  $('calh').textContent=calTitle();
  $('listh').textContent='All '+data.days.length+' ships, in order';
  $('calnote').textContent=S.calendar_note||'';
  $('calnote').hidden=!S.calendar_note;
}
function calTitle(){
  var a=S.start.split('-'),b=S.end.split('-');
  if(a[0]===b[0]&&a[1]===b[1])return MONTHS[+a[1]-1]+' '+a[0];
  return pretty(S.start)+' to '+pretty(S.end);
}

function tick(){
  var now=Date.now(),today=isoDay(now+OFF),shipped=data.days.filter(function(d){return d.status==='shipped'}).length,N=data.days.length;
  var target,state;
  if(now<T0){target=T0;state='Starts soon'}else if(now<T1){target=T1;state='Live now'}else{target=now;state='Wrapped'}
  var ms=Math.max(0,target-now),s=Math.floor(ms/1000);
  $('cd').textContent=pad(Math.floor(s/86400));$('ch').textContent=pad(Math.floor(s%86400/3600));
  $('cm').textContent=pad(Math.floor(s%3600/60));$('cs').textContent=pad(s%60);
  $('state').textContent=state;
  var endTxt=pretty(S.end);
  $('until').textContent=now<T0?'until '+pretty(S.start)+' kicks off':now<T1?'until '+endTxt+' ends, 11:59 pm (UTC'+S.timezone_offset+')':'That is a wrap.';
  var left=Math.max(0,Math.ceil(ms/DAY));
  $('left').textContent=(now<T1?left+(left===1?' day':' days')+' left, ':'')+shipped+' of '+N+' shipped';
  $('barfill').style.width=(N?100*shipped/N:0)+'%';
  $('clock').setAttribute('aria-label',$('cd').textContent+' days '+$('ch').textContent+' hours left');
  return today;
}
function finale(){
  var l=data.days.filter(function(d){return d.slug===S.finale_slug})[0]||data.days[data.days.length-1];
  if(!l)return;
  $('finale').textContent='';
  $('finale').appendChild(document.createTextNode('Finale on '+pretty(l.day)+': '));
  $('finale').appendChild(el('b',null,l.name));
}

function card(d,today){
  var p=pillFor(d,today),a=el('a','card '+p[0]);
  a.style.setProperty('--h',d.hue!=null?d.hue:(d.slot*47)%360);
  a.href=d.url||'#p-'+d.slot;
  if(d.url){a.target='_blank';a.rel='noopener'}
  var i=el('img');i.src=img(d);i.alt='';i.loading='lazy';i.width=320;i.height=180;a.appendChild(i);
  a.appendChild(el('span','chip',d.slot));
  a.appendChild(el('span','nm',d.name));
  a.appendChild(el('span','what',d.pitch||''));
  var ex=el('span','ex');ex.appendChild(pill(d,today));
  a.appendChild(ex);
  a.setAttribute('aria-label','Ship '+d.slot+', '+d.name+', '+p[1]+(d.url?', opens project':', details below'));
  return a;
}
function calendar(today){
  var host=$('cal');host.textContent='';
  var by={};data.days.forEach(function(d){(by[d.day]=by[d.day]||[]).push(d)});
  var s=S.start.split('-'),e=S.end.split('-');
  var y=+s[0],mo=+s[1]-1,ey=+e[0],em=+e[1]-1;
  while(y<ey||(y===ey&&mo<=em)){
    host.appendChild(month(y,mo,by,today));
    mo++;if(mo>11){mo=0;y++}
  }
}
function month(y,mo,by,today){
  var wrap=el('div','month');
  if(S.start.slice(0,7)!==S.end.slice(0,7))wrap.appendChild(el('h3','mh',MONTHS[mo]+' '+y));
  var t=el('table','cal');
  var hr=el('tr');['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(function(n){var th=el('th',null,n);th.scope='col';hr.appendChild(th)});
  var th=el('thead');th.appendChild(hr);t.appendChild(th);
  var tb=el('tbody'),tr=el('tr'),cells=0;
  function push(td){tr.appendChild(td);if(++cells%7===0){tb.appendChild(tr);tr=el('tr')}}
  function blank(){var b=el('td','blank');b.setAttribute('aria-hidden','true');return b}
  var lead=(new Date(Date.UTC(y,mo,1)).getUTCDay()+6)%7,dim=new Date(Date.UTC(y,mo+1,0)).getUTCDate();
  for(var i=0;i<lead;i++)push(blank());
  for(var n=1;n<=dim;n++){
    var iso=y+'-'+pad(mo+1)+'-'+pad(n);
    if(iso<S.start||iso>S.end){push(blank());continue}
    var ds=by[iso]||[],td=el('td',ds.length?'':'quiet');
    if(iso===today)td.className+=' today';
    td.appendChild(el('span','dn',String(n)));
    ds.forEach(function(d){td.appendChild(card(d,today))});
    if(!ds.length&&iso<today)td.title='Nothing planned for this day';
    push(td);
  }
  while(cells%7)push(blank());
  t.appendChild(tb);wrap.appendChild(t);return wrap;
}
function list(today){
  var ol=$('list');ol.textContent='';
  data.days.forEach(function(d){
    var li=el('li');li.id='p-'+d.slot;
    li.style.setProperty('--h',d.hue!=null?d.hue:(d.slot*47)%360);
    var i=el('img');i.src=img(d);i.alt='';i.loading='lazy';i.width=320;i.height=180;li.appendChild(i);
    var b=el('div','lb');
    var h=el('h3',null,d.name+' ');h.appendChild(pill(d,today));b.appendChild(h);
    b.appendChild(el('p',null,d.pitch||''));
    b.appendChild(el('p','meta','#'+d.slot+' / '+d.day+(d.number?' / '+d.number:'')));
    if(d.url){var a=el('a','open','Open '+d.name);a.href=d.url;a.target='_blank';a.rel='noopener';b.appendChild(a)}else b.appendChild(el('span','soon','link coming soon'));
    li.appendChild(b);ol.appendChild(li);
  });
}

function copyInit(){
  var btn=document.querySelector('.copy-prompt'),pre=$('prompt'),st=$('copystatus');
  if(!btn)return;
  var timer;
  function done(ok){
    var lab=btn.querySelector('.copy-label');
    btn.classList.toggle('copied',ok);
    lab.textContent=ok?'Copied':'Press Ctrl+C';
    st.textContent=ok?'Prompt copied to clipboard.':'Could not copy automatically. The prompt is selected, press Ctrl+C.';
    clearTimeout(timer);timer=setTimeout(function(){btn.classList.remove('copied');lab.textContent='Copy prompt'},2500);
  }
  function legacy(){
    var ta=document.createElement('textarea');ta.value=pre.textContent;ta.setAttribute('readonly','');
    ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);ta.focus();ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}
    document.body.removeChild(ta);
    if(!ok){var r=document.createRange();r.selectNodeContents(pre);var sel=window.getSelection();sel.removeAllRanges();sel.addRange(r)}
    return ok;
  }
  btn.addEventListener('click',function(){
    var txt=pre.textContent;
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(txt).then(function(){done(true)},function(){done(legacy())});
    }else done(legacy());
  });
}

function start(j){
  setup(j);bindStatic();
  var today=tick();finale();calendar(today);list(today);
  setInterval(function(){var t=tick();if(t!==today){today=t;calendar(today);list(today)}},1000);
}
copyInit();
function fallback(){
  var sc=document.createElement('script');sc.src='days.js';
  sc.onload=function(){start(window.BUILDTOBER_DAYS)};
  sc.onerror=function(){$('left').textContent='Could not load days.json'};
  document.head.appendChild(sc);
}
if(location.protocol==='file:')fallback();
else fetch('days.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(start).catch(fallback);
})();
