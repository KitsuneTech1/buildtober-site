(function(){
'use strict';
var END=Date.parse('2026-10-31T23:59:00-05:00'),TZ=-5*3600000,DAY=86400000;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function chicagoDate(now){return new Date(now+TZ).toISOString().slice(0,10)}
function dayDiff(a,b){return Math.round((Date.parse(a)-Date.parse(b))/DAY)}
function pillFor(d,today){
  if(d.status==='shipped')return['shipped','shipped'];
  var n=dayDiff(d.day,today);
  if(n===0)return['today','today'];
  if(n<0)return['due','due'];
  return['',n===1?'tomorrow':'in '+n+' days'];
}
function loc(d){return d.number||''}
var data,now=Date.now();
function header(){
  now=Date.now();
  var ms=END-now,left=Math.max(0,Math.ceil(ms/DAY));
  var shipped=data.days.filter(function(d){return d.status==='shipped'}).length;
  document.getElementById('left').textContent=left+(left===1?' day':' days')+' left, '+shipped+' of '+data.days.length+' shipped';
  var s=Math.max(0,Math.floor(ms/1000)),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
  document.getElementById('tick').textContent=d+'d '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m '+String(s%60).padStart(2,'0')+'s until Oct 31, 11:59 pm Central';
  document.getElementById('barfill').style.width=(100*shipped/data.days.length)+'%';
}
function finale(){var l=data.days[data.days.length-1];document.getElementById('finale').textContent='Finale on '+l.day.slice(5).replace('-','/')+': '+l.name}
function pill(d,today){var p=pillFor(d,today);return el('span','pill '+p[0],p[1])}
function card(d,today){
  var a=el('a','card');
  a.style.setProperty('--h',d.hue);
  var p=pillFor(d,today);
  a.href=d.url||'#p-'+d.slot;
  var img=el('img');img.src=d.image;img.alt=d.name+' placeholder card, slot '+d.slot;img.loading='lazy';
  a.appendChild(img);
  var chip=el('span','chip',d.slot);chip.style.setProperty('--h',d.hue);chip.setAttribute('aria-hidden','true');
  a.appendChild(chip);
  a.appendChild(el('span','nm',d.name));
  a.appendChild(el('span','what',d.pitch));
  var ex=el('span','ex');ex.appendChild(pill(d,today));ex.appendChild(document.createTextNode(' '));
  ex.appendChild(d.url?el('span','go','Open'):el('span','soon','soon'));
  a.appendChild(ex);
  a.setAttribute('aria-label',d.name+', '+p[1]+(d.url?'':', link coming soon, jumps to details'));
  var w=el('div');w.appendChild(a);
  return a;
}
function calendar(){
  var today=chicagoDate(now);
  var by={};data.days.forEach(function(d){(by[d.day]=by[d.day]||[]).push(d)});
  var t=el('table','cal');t.appendChild(el('caption',null,'Dashed days are before the list existed (Oct 1 to 12).'));
  var hr=el('tr');['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(function(n){var th=el('th',null,n);th.scope='col';hr.appendChild(th)});
  var th=el('thead');th.appendChild(hr);t.appendChild(th);
  var tb=el('tbody'),tr=el('tr');
  var first=new Date(Date.UTC(2026,9,1)).getUTCDay(),lead=(first+6)%7,cells=0;
  function push(td){tr.appendChild(td);if(++cells%7===0){tb.appendChild(tr);tr=el('tr')}}
  for(var i=0;i<lead;i++){var b=el('td','blank');b.setAttribute('aria-hidden','true');push(b)}
  for(var n=1;n<=31;n++){
    var iso='2026-10-'+String(n).padStart(2,'0'),ds=by[iso]||[];
    var td=el('td',ds.length?'':'quiet');if(iso===today)td.className+=' today';
    td.appendChild(el('span','dn',String(n)));
    ds.forEach(function(d){td.appendChild(card(d,today))});
    if(!ds.length&&iso<today)td.title='Before the list was made';
    push(td);
  }
  while(cells%7){var e=el('td','blank');e.setAttribute('aria-hidden','true');push(e)}
  t.appendChild(tb);
  var host=document.getElementById('cal');host.textContent='';host.appendChild(t);
}
function list(){
  var today=chicagoDate(now),ol=document.getElementById('list');ol.textContent='';
  data.days.forEach(function(d){
    var li=el('li');li.id='p-'+d.slot;
    var img=el('img');img.src=d.image;img.alt=d.name+' placeholder card, slot '+d.slot;img.loading='lazy';img.width=160;
    li.appendChild(img);
    var b=el('div');
    var h=el('h3',null,d.name+' ');b.appendChild(h);h.appendChild(pill(d,today));
    b.appendChild(el('p',null,d.pitch));
    b.appendChild(el('p','meta','#'+d.slot+' / '+d.day+(loc(d)?' / '+loc(d):'')));
    if(d.url){var a=el('a',null,'Open '+d.name);a.href=d.url;b.appendChild(a)}else b.appendChild(el('span','soon','soon'));
    li.appendChild(b);ol.appendChild(li);
  });
}
function start(j){data=j;header();finale();calendar();list();setInterval(header,1000)}
function fallback(){
  var sc=document.createElement('script');sc.src='days.js';
  sc.onload=function(){start(window.BUILDTOBER_DAYS)};
  sc.onerror=function(){document.getElementById('left').textContent='Could not load days.json'};
  document.head.appendChild(sc);
}
if(location.protocol==='file:')fallback();
else fetch('days.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(start).catch(fallback);
})();
