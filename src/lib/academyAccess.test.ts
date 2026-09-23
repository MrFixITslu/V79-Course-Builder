import assert from 'node:assert/strict';
import { canReadCourse, courseSummary, deleteCourseRecords, hasMembership, lessonSummary } from './academyAccess';
const future = new Date(Date.now()+86400000).toISOString();
assert.equal(canReadCourse({pricingType:'free'},null),true);
for(const pricingType of ['subscription','premium','free_trial']) {
  assert.equal(canReadCourse({pricingType},null),false);
  assert.equal(canReadCourse({pricingType},{membershipStatus:'active',membershipExpiresAt:future}),true);
  assert.equal(canReadCourse({pricingType},{membershipStatus:'inactive',membershipExpiresAt:future}),false);
}
assert.equal(hasMembership({membershipStatus:'active',membershipExpiresAt:'2000-01-01'}),false);
const db:any={courses:[{id:'a'},{id:'b'}],modules:[{id:'m',courseId:'a'}],lessons:[{id:'l',courseId:'a'},{id:'keep',courseId:'b'}],quizzes:[{lessonId:'l'}],contentBlocks:[{lessonId:'l'}],assignments:[{courseId:'a'}],publishingLogs:[{id:'seed-marker'}]};
const summary=courseSummary({id:'a',programme:{finalExam:{questions:[{correctAnswer:'secret'}]}}},db,true);
assert.equal(summary.programme.finalExam.questions[0].correctAnswer,'');
assert.equal(courseSummary({id:'a',programme:{secret:true}},db,false).programme,undefined);
assert.equal((lessonSummary({id:'l',lessonContent:'secret',videoUrl:'secret'}) as any).lessonContent,undefined);
deleteCourseRecords(db,'a');assert.deepEqual(db.courses,[{id:'b'}]);assert.equal(db.quizzes.length,0);assert.equal(db.contentBlocks.length,0);assert.equal(db.assignments.length,0);assert.equal(db.lessons[0].id,'keep');assert.equal(db.publishingLogs.length,1);
console.log('✓ Academy access and deletion tests passed');
