// Only authoritative course verification may populate this input. Links/clicks never qualify.
export function learningMilestones(courseUrls: string[], verified: ReadonlySet<string>) {
 const courses=[...new Set(courseUrls)];
 const completed=courses.filter(url=>verified.has(url)).length;
 return {first:verified.size>0,plan:courses.length>0&&completed===courses.length,completed,total:courses.length};
}
