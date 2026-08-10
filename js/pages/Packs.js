import { fetchPacks } from '../content.js';
import Spinner from '../components/Spinner.js';

export default {
    components: { Spinner },
    data: () => ({
        packs: [],
        loading: true,
        selectedPack: 0
    }),
    template: `
        <main v-if="loading" class="spinner-container">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-packs-container">
            <div class="page-packs">
                <div class="packs-list">
                    <div 
                        v-for="(pack, i) in packs" 
                        :key="i" 
                        class="pack-card"
                        :class="{ 'active': selectedPack === i }"
                        :style="{ '--pack-color': pack.color || '#006D5B' }"
                        @click="selectedPack = i"
                    >
                        <div class="pack-badge"></div>
                        <div class="pack-info">
                            <h3>{{ pack.name }}</h3>
                            <p>{{ pack.levels.length }} Levels</p>
                        </div>
                    </div>
                </div>

                <div class="pack-details-container">
                    <div class="pack-details" v-if="currentPack">
                        <div class="pack-header" :style="{ borderColor: currentPack.color || '#006D5B' }">
                            <h1>{{ currentPack.name }}</h1>
                            <span class="pack-count">{{ currentPack.levels.length }} Levels Required</span>
                        </div>

                        <h2>Required Levels</h2>
                        <ul class="pack-levels-list">
                            <li v-for="level in currentPack.levels" :key="level.path">
                                <span class="rank" v-if="level.rank">#{{ level.rank }}</span>
                                <span class="rank" v-else>Legacy</span>
                                <span class="level-name">{{ level.name }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        currentPack() {
            return this.packs[this.selectedPack] || null;
        }
    },
    async mounted() {
        this.packs = (await fetchPacks()) || [];
        this.loading = false;
    }
}; // nuhhhhhhhhhhhhhh
