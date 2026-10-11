const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../data.js'), N = require('../navigation.js');
const now = new Date(2026, 9, 11, 12).getTime();
function state() {const s=D.emptyState();s.settings={lastView:'settings',lastOpenedDay:N.day(now),lastBackgroundAt:null};return s;}
test('first opening of local calendar day and day change always show start',()=>{
 const s=state();s.settings.lastOpenedDay=null;assert.equal(N.entryView(s,now),'start');
 s.settings.lastOpenedDay=N.day(now-86400000);s.settings.lastBackgroundAt=now-1000;assert.equal(N.entryView(s,now),'start');
 assert.equal(N.day(new Date(2026,0,2,0,0).getTime()),'2026-01-02');
});
test('less than 60 minutes restores view; exact 60 minutes and longer show start',()=>{
 const s=state();s.settings.lastBackgroundAt=now-N.ABSENCE_MS+1;assert.equal(N.entryView(s,now),'settings');
 s.settings.lastBackgroundAt=now-N.ABSENCE_MS;assert.equal(N.entryView(s,now),'start');
 s.settings.lastBackgroundAt=now-N.ABSENCE_MS-1;assert.equal(N.entryView(s,now),'start');
 s.settings.lastBackgroundAt=null;assert.equal(N.entryView(s,now),'settings');
 s.settings.lastBackgroundAt=now+1000;assert.equal(N.entryView(s,now),'settings');
});
test('active session takes priority over all day/absence/view rules',()=>{
 const s=state();s.activeSession={id:'active'};s.settings.lastOpenedDay=null;s.settings.lastBackgroundAt=0;assert.equal(N.entryView(s,now),'active');
});
test('empty transient views fall back; saved summary can be restored',()=>{
 const s=state();s.settings.lastView='active';assert.equal(N.entryView(s,now),'training');
 s.settings.lastView='summary';assert.equal(N.entryView(s,now),'training');s.completedSessions=[{}];assert.equal(N.entryView(s,now),'summary');
});
test('clean stores refresh external data without overwriting; dirty and invalid data stay protected',()=>{
 let raw=null;const storage={getItem:()=>raw,setItem:(key,value)=>{raw=value;}};
 const a=D.createStore({storage}),b=D.createStore({storage});a.load();b.load();
 a.update(s=>{s.settings.lastView='backup';});assert.ok(b.refresh().ok);assert.equal(b.getState().settings.lastView,'backup');
 b.update(s=>{s.settings.lastView='plans';});assert.ok(a.refresh().ok);assert.equal(a.getState().settings.lastView,'plans');
 const write=storage.setItem;storage.setItem=()=>{throw Error('quota');};a.update(s=>{s.settings.lastView='exercises';});
 raw=JSON.stringify(D.emptyState());assert.equal(a.refresh().ok,false);assert.equal(a.getState().settings.lastView,'exercises');assert.ok(a.getStatus().dirty);
 storage.setItem=write;raw='broken';assert.equal(b.refresh().ok,false);assert.ok(b.getStatus().blocked);assert.equal(raw,'broken');
});
