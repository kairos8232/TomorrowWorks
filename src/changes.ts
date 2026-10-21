// "What changed": compare the same person's moves under the previous and the
// latest DOSM snapshot, and say why each move went up or down.
// Only the demand part differs between snapshots (skills and ILO exposure are
// the same), so the reason is always the job-ad change. Tested in src/changes.test.ts.
import type { RoleScore } from './scoring';

export type MoveChange = {
  role: RoleScore['role'];
  rankBefore: number;
  rankAfter: number;
  scoreBefore: number;
  scoreAfter: number;
  group: string | null;
  changeBefore: number | null; // job-ad change in the earlier snapshot's quarter
  changeAfter: number | null;  // job-ad change in the latest quarter
  quarterBefore: string | null;
  quarterAfter: string | null;
};

export function whatChanged(before: RoleScore[], after: RoleScore[]): MoveChange[] {
  const rankOf = (list: RoleScore[], id: string) => list.findIndex((m) => m.role.id === id) + 1;
  return after
    .map((a) => {
      const b = before.find((m) => m.role.id === a.role.id)!;
      return {
        role: a.role,
        rankBefore: rankOf(before, a.role.id),
        rankAfter: rankOf(after, a.role.id),
        scoreBefore: b.score100,
        scoreAfter: a.score100,
        group: a.demand?.group ?? b.demand?.group ?? null,
        changeBefore: b.demand?.change ?? null,
        changeAfter: a.demand?.change ?? null,
        quarterBefore: b.demand ? `${b.demand.previous} to ${b.demand.current}` : null,
        quarterAfter: a.demand ? `${a.demand.previous} to ${a.demand.current}` : null,
      };
    })
    .filter((c) => c.rankBefore !== c.rankAfter || c.scoreBefore !== c.scoreAfter)
    .sort((x, y) => Math.abs(y.rankBefore - y.rankAfter) - Math.abs(x.rankBefore - x.rankAfter)
      || Math.abs(y.scoreAfter - y.scoreBefore) - Math.abs(x.scoreAfter - x.scoreBefore));
}
