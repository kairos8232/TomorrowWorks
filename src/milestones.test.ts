import {describe,it,expect} from 'vitest';
import {learningMilestones} from './milestones';
describe('verified learning milestones',()=>{
 it('does not award an empty plan or a first badge without a verified completion',()=>{
  expect(learningMilestones([],new Set())).toEqual({first:false,plan:false,completed:0,total:0});
 });
 it('first course applies across plans, but the plan badge requires every selected course',()=>{
  expect(learningMilestones(['a','b'],new Set(['other']))).toEqual({first:true,plan:false,completed:0,total:2});
  expect(learningMilestones(['a','b'],new Set(['a']))).toEqual({first:true,plan:false,completed:1,total:2});
 });
 it('counts unique course URLs and includes every suggested course supplied by the plan',()=>{
  expect(learningMilestones(['checked','checked','suggested'],new Set(['checked','suggested']))).toEqual({first:true,plan:true,completed:2,total:2});
 });
 it('revokes eligibility when a verification is removed or a new plan course is added',()=>{
  expect(learningMilestones(['a','b'],new Set(['a'])).plan).toBe(false);
  expect(learningMilestones(['a'],new Set()).first).toBe(false);
  expect(learningMilestones([],new Set(['a'])).plan).toBe(false);
 });
});
