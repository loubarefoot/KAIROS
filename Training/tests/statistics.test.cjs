const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('../statistics.js');
const now=new Date(2026,9,16,12).getTime();
const ex=(id,status,weightKg,isMax=false)=>({id,name:id,status,weightKg,isMax});
const session=(days,durationMs,items)=>({id:String(days),startedAt:new Date(2026,9,16-days,12).getTime(),durationMs,exercises:items});
const rows=[session(0,60000,[ex('a','completed',12),ex('b','skipped',15),ex('c','open',20)]),session(6,120000,[ex('a','completed',10)]),session(7,180000,[ex('a','completed',8)]),session(29,240000,[]),session(30,300000,[]),session(89,360000,[]),session(90,420000,[])];
test('calendar ranges include today and exact lower midnight; no mutation',()=>{
 const before=JSON.stringify(rows);
 assert.equal(S.filter(rows,'7',now).length,2);assert.equal(S.filter(rows,'30',now).length,4);assert.equal(S.filter(rows,'90',now).length,6);assert.equal(S.filter(rows,'all',now).length,7);
 const midnight=new Date(2026,9,10).getTime();assert.equal(S.filter([{startedAt:midnight},{startedAt:midnight-1},{startedAt:now+1}],'7',now).length,1);
 assert.equal(JSON.stringify(rows),before);
});
test('metrics count actual statuses and known durations only',()=>{
 assert.deepEqual(S.metrics(S.filter(rows,'7',now)),{sessions:2,total:180000,average:90000,missingDuration:0,completed:2,skipped:1});
 assert.equal(S.metrics([]).total,0);assert.equal(S.metrics([]).average,null);
 assert.equal(S.metrics([{exercises:[]}]).total,null);
 assert.equal(S.metrics([rows[0],{exercises:[]}]).average,60000);
});
test('historical weights exclude MAX retained values, open/skipped and missing weights',()=>{
 const data=[session(0,0,[ex('a','completed',null)]),session(1,0,[ex('a','completed',70,true)]),session(2,0,[ex('a','skipped',80)]),session(3,0,[ex('a','open',90)]),session(4,0,[ex('a','completed',0)]),session(5,0,[ex('a','completed',12.5)])];
 assert.deepEqual(S.weights(data,'a').map(p=>p.value),[12.5,0]);
 assert.equal(S.choices(data).length,1);assert.deepEqual(S.weights(data,'deleted'),[]);
});
test('history and exercise identity survive rename, deletion and serialized import',()=>{
 const data=JSON.parse(JSON.stringify(rows));data[0].exercises[0].name='New name';data[1].exercises[0].name='Old name';
 assert.equal(S.choices(data).find(e=>e.id==='a').name,'New name');assert.equal(S.history(data)[1].exercises[0].name,'Old name');
 assert.deepEqual(S.metrics(data),S.metrics(rows));assert.deepEqual(S.weights(data,'a'),S.weights(rows,'a'));
});
test('calendar weeks start Monday across year boundary and single/large inputs work',()=>{
 const data=[{startedAt:new Date(2025,11,29).getTime()},{startedAt:new Date(2026,0,4).getTime()},{startedAt:new Date(2026,0,5).getTime()}];
 assert.deepEqual(S.weeks(data).map(p=>p.value),[2,1]);assert.equal(S.weeks([data[0]]).length,1);assert.deepEqual(S.weeks([]),[]);
 assert.equal(S.metrics(Array.from({length:1000},()=>rows[0])).sessions,1000);
});
test('missing historical fields remain unavailable and never become zero weight',()=>{
 const old={id:'old',exercises:[{id:'a',status:'completed',weightKg:null}]};
 assert.equal(S.date(old),null);assert.equal(S.duration(old),null);assert.equal(S.metrics([old]).average,null);
 assert.deepEqual(S.weights([old],'a'),[]);assert.deepEqual(S.filter([old],'30',now),[]);assert.deepEqual(S.filter([old],'all',now),[old]);
 assert.deepEqual(S.history([old,rows[0]]),[rows[0],old]);
});
test('calendar-day filtering crosses daylight saving changes without assuming 24-hour days',()=>{
 const end=new Date(2026,9,28,12).getTime(),start=new Date(2026,9,22).getTime();
 assert.deepEqual(S.filter([{startedAt:start},{startedAt:start-1}],'7',end),[{startedAt:start}]);
});
test('full 7/30/90 calendar-day domains include empty days and all spans all recorded dates',()=>{
 for(const n of [7,30,90]){
  const r=S.domain(rows,String(n),now),first=new Date(r.start),last=new Date(r.end);
  assert.equal(first.getHours(),0);assert.equal(last.getHours(),23);
  assert.equal(Math.round((Date.UTC(last.getFullYear(),last.getMonth(),last.getDate())-Date.UTC(first.getFullYear(),first.getMonth(),first.getDate()))/86400000)+1,n);
  if(n===7)assert.equal(S.timeTicks(r,'7',194).length,7);
 }
 const all=S.domain(rows,'all',now);assert.ok(all.start<=rows.at(-1).startedAt);assert.ok(all.end>=rows[0].startedAt);
 const small=S.domain(rows,'90',now);assert.ok(S.timeTicks(small,'90',194).length<=3);
 assert.equal(new Set(S.timeTicks(small,'90',194)).size,S.timeTicks(small,'90',194).length);
});
test('weight scales resolve small increases and equal values without adding measurements',()=>{
 const s=S.axis([60,62.5],'weight');assert.ok(s.min<60&&s.max>62.5);assert.ok(s.max-s.min<10);
 const equal=S.axis([60,60],'weight');assert.ok(equal.min<60&&equal.max>60);assert.ok(equal.max>equal.min);
 assert.ok(S.axis([0],'weight').min>=0);assert.deepEqual(S.axis([],'weight').ticks,[]);
 for(const values of [[1],[1,7],[3,31],[0]]){
  const scale=S.axis(values,'count');assert.ok(scale.ticks.every(Number.isInteger));assert.ok(scale.min===0&&scale.max>=Math.max(...values));
 }
 const short=S.axis([0.25,0.75],'duration');assert.equal(short.min,0);assert.ok(short.max>=0.75);
});
test('ISO weeks include week-year boundaries and gap weeks are counted as zero',()=>{
 for(const [y,m,d,year,week] of [[2021,0,1,2020,53],[2021,0,4,2021,1],[2024,11,30,2025,1],[2026,11,31,2026,53]])assert.deepEqual(S.isoWeek(new Date(y,m,d).getTime()),{year,week});
 const data=[{startedAt:new Date(2026,9,5,12).getTime()},{startedAt:new Date(2026,9,19,12).getTime()}];
 assert.deepEqual(S.weeks(data,S.domain(data,'all',now)).map(p=>p.value),[1,0,1]);
});
test('multiple actual measurements on one day, including coincident times, remain separate',()=>{
 const same=rows[0].startedAt,items=[{startedAt:same,exercises:[ex('a','completed',60)]},{startedAt:same,exercises:[ex('a','completed',62.5)]},{startedAt:same+3600000,exercises:[ex('a','completed',61)]}];
 assert.equal(S.weights(items,'a').length,3);assert.deepEqual(S.weights(items,'a').map(p=>p.time),[same,same,same+3600000]);assert.deepEqual(new Set(S.weights(items,'a').map(p=>p.value)),new Set([60,62.5,61]));
});
