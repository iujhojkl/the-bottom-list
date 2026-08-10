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
                            <p>{{ pack.levels ? pack.levels.length : 0 }} Levels</p>
                        </div>
                    </div>
                </div>

                <div class="pack-details-container">
                    <div class="pack-details" v-if="currentPack">
                        <div class="pack-header" :style="{ borderLeftColor: currentPack.color || '#006D5B' }">
                            <h1>{{ currentPack.name }}</h1>
                            <span class="pack-count">{{ currentPack.levels ? currentPack.levels.length : 0 }} Levels Required</span>
                        </div>

                        <h2 class="section-title">Required Levels</h2>
                        <ul class="pack-levels-list">
                            <li v-for="level in currentPack.levels" :key="level.path" class="pack-level-item">
                                <span class="rank" v-if="level.rank">#{{ level.rank }}</span>
                                <span class="rank legacy" v-else>Legacy</span>
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
};
