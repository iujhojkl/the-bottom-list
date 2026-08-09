import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading" class="spinner-container" style="display: flex; justify-content: center; align-items: center; min-height: 50vh;">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container" v-if="err && err.length > 0">
                    <p class="error" style="background: rgba(222,0,0,0.15); color: #ff6666; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                        Leaderboard issue: {{ Array.isArray(err) ? err.join(', ') : err }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board" v-if="leaderboard && leaderboard.length > 0">
                        <tr v-for="(ientry, i) in leaderboard" :key="i">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected === i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                    <p v-else-if="!loading" style="opacity: 0.7; padding: 1rem;">No leaderboard records found.</p>
                </div>

                <div class="player-container">
                    <div class="player" v-if="entry">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ localize(entry.total) }} Points</h3>

                        <template v-if="entry.verified && entry.verified.length > 0">
                            <h2>Verified ({{ entry.verified.length }})</h2>
                            <table class="table">
                                <tr v-for="(score, idx) in entry.verified" :key="'v-'+idx">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>
                        </template>

                        <template v-if="entry.completed && entry.completed.length > 0">
                            <h2>Completed ({{ entry.completed.length }})</h2>
                            <table class="table">
                                <tr v-for="(score, idx) in entry.completed" :key="'c-'+idx">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>
                        </template>

                        <template v-if="entry.progressed && entry.progressed.length > 0">
                            <h2>Progressed ({{ entry.progressed.length }})</h2>
                            <table class="table">
                                <tr v-for="(score, idx) in entry.progressed" :key="'p-'+idx">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a></td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>
                        </template>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard ? this.leaderboard[this.selected] : null;
        },
    },
    async mounted() {
        // Guarantee loading state ends even if the fetch hangs or fails
        const stopLoading = setTimeout(() => {
            if (this.loading) {
                this.loading = false;
                if (!this.leaderboard.length) {
                    this.err = ["Request timed out while loading leaderboard data."];
                }
            }
        }, 5000);

        try {
            const data = await fetchLeaderboard();
            
            if (Array.isArray(data)) {
                if (Array.isArray(data[0])) {
                    this.leaderboard = data[0];
                    this.err = data[1] || [];
                } else {
                    this.leaderboard = data;
                }
            } else if (data && data.leaderboard) {
                this.leaderboard = data.leaderboard;
                this.err = data.err || [];
            }
        } catch (e) {
            console.error("Leaderboard fetch error:", e);
            this.err = ["Failed to load leaderboard data from server."];
        } finally {
            clearTimeout(stopLoading);
            this.loading = false;
        }
    },
    methods: {
        localize,
    },
};
