import {describe,expect,it} from 'vitest';
import {credentialUrl,advanceLearning,activityCount} from './learningCheck';
describe('demo credential evidence',()=>{
 it('accepts HTTPS links but rejects malformed and unsafe schemes or embedded credentials',()=>{
  expect(credentialUrl(' https://example.org/credentials/demo ')).toBe('https://example.org/credentials/demo');
  for(const url of ['', 'not a url','http://example.org','javascript:alert(1)','data:text/html,test','https://user:password@example.org','https://localhost', 'https://example.org/'+ 'a'.repeat(2000)]) expect(credentialUrl(url)).toBeNull();
 });
 it('permits editing and removal without introducing a verified state',()=>{
  const submitted=advanceLearning(undefined,{type:'submit',url:'https://example.org/demo'})!;
  expect(submitted).toEqual({url:'https://example.org/demo'});
  expect(advanceLearning(submitted,{type:'submit',url:'invalid'})).toEqual(submitted);
  const edited=advanceLearning(submitted,{type:'submit',url:'https://example.org/new'})!;
  expect(edited.url).toBe('https://example.org/new');
  expect(advanceLearning(edited,{type:'remove'})).toBeUndefined();
 });
 it('counts submissions only for unique current-plan courses',()=>{
  const evidence={a:{url:'https://example.org/a'},other:{url:'https://example.org/other'}};
  expect(activityCount(['a','a','b'],evidence)).toEqual({total:2,recorded:1});
  expect(activityCount([],evidence)).toEqual({total:0,recorded:0});
 });
});
