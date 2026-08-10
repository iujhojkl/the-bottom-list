import { round, score } from './score.js';

const dir = '/data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    try {
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    return [
                        {
                            ...level,
                            path,
                            records: (level.records || []).sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();

    if (!list) return [[], ['Failed to load list data.']];

    const scoreMap = {};
    const errs = [];

    list.forEach(([level, err], rank) => {
        if (err || !level) {
            if (err) errs.push(err);
            return;
        }

        const verifierName = level.verifier || 'Unknown Verifier';
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === verifierName.toLowerCase(),
        ) || verifierName;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name || 'Unknown Level',
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification || '',
        });

        (level.records || []).forEach((record) => {
            if (!record) return;

            const recordUser = record.user || 'Unknown User';
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === recordUser.toLowerCase(),
            ) || recordUser;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name || 'Unknown Level',
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link || '',
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name || 'Unknown Level',
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link || '',
            });
        });
    });

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + (cur.score || 0), 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}

export async function fetchPacks() {
    try {
        const packsResult = await fetch(`${dir}/_packs.json`);
        const packs = await packsResult.json();
        const list = await fetchList();

        if (!list) return null;

        return packs.map((pack) => {
            const packLevels = (pack.levels || []).map((path) => {
                const foundIndex = list.findIndex(([level]) => level?.path === path);
                const levelData = list[foundIndex]?.[0];
                return {
                    path,
                    name: levelData?.name || path,
                    rank: foundIndex !== -1 ? foundIndex + 1 : null,
                };
            });

            return {
                ...pack,
                levels: packLevels,
            };
        });
    } catch {
        console.error('Failed to load packs.');
        return null;
    }
}
