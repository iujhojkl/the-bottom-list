import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading" class="page-loading" style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list" style="display: flex; gap: 2rem; max-width: 1400px; margin: 0 auto; padding: 2rem 1rem;">
            <div class="list-container" style="flex: 0 0 320px;">
                <table class="list" v-if="list" style="width: 100%; border-collapse: separate; border-spacing: 0 6px;">
                    <tr v-for="([level, err], i) in list" :key="i">
                        <td class="rank" style="padding: 10px; width: 60px; text-align: center;">
                            <p v-if="i + 1 <= 150" class="type-label-lg" style="font-weight: 700; opacity: 0.85;">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg" style="font-size: 0.85rem; opacity: 0.5;">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }" style="border-radius: 8px; overflow: hidden; transition: all 0.2s ease;">
                            <button @click="selected = i" style="width: 100%; text-align: left; padding: 12px 16px; border: none; cursor: pointer; background: transparent; font-weight: 600;">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="level-container" style="flex: 1; min-width: 0;">
                <div class="level-card" v-if="level" style="background: var(--bg-secondary, #1e1e24); border-radius: 12px; padding: 2rem; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
                    
                    <header style="margin-bottom: 1.5rem;">
                        <h1 style="font-size: 2.2rem; margin-bottom: 0.25rem; font-weight: 700;">{{ level.name }}</h1>
                        <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    </header>

                    <div class="video-container" style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 10px; overflow: hidden; background: #000; margin-bottom: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
                        <iframe class="video" id="videoframe" :src="video" frameborder="0" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
                    </div>

                    <ul class="stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; list-style: none; padding: 0; margin-bottom: 2rem;">
                        <li style="background: rgba(255,255,255,0.04); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                            <div class="type-title-sm" style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 4px;">Points</div>
                            <p style="font-size: 1.25rem; font-weight: 700;">{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li style="background: rgba(255,255,255,0.04); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                            <div class="type-title-sm" style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 4px;">ID</div>
                            <p style="font-size: 1.25rem; font-weight: 700;">{{ level.id }}</p>
                        </li>
                        <li style="background: rgba(255,255,255,0.04); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                            <div class="type-title-sm" style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 4px;">Password</div>
                            <p style="font-size: 1.25rem; font-weight: 700;">{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>

                    <section class="records-section">
                        <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Records</h2>
                        <div class="requirement-notice" style="margin-bottom: 1rem; opacity: 0.8; font-size: 0.95rem;">
                            <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                            <p v-else-if="selected + 1 <= 150"><strong>100%</strong> or better to qualify</p>
                            <p v-else style="color: #ff5555;">This level does not accept new records.</p>
                        </div>

                        <table class="records" style="width: 100%; border-collapse: separate; border-spacing: 0 4px;">
                            <tr v-for="record in level.records" class="record" style="background: rgba(255,255,255,0.02); border-radius: 6px;">
                                <td class="percent" style="padding: 10px 14px; font-weight: 700; width: 70px;">
                                    <p>{{ record.percent }}%</p>
                                </td>
                                <td class="user" style="padding: 10px 14px;">
                                    <a :href="record.link" target="_blank" class="type-label-lg" style="text-decoration: none;">{{ record.user }}</a>
                                </td>
                                <td class="mobile" style="padding: 10px 14px; text-align: center; width: 40px;">
                                    <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile" style="height: 16px;">
                                </td>
                                <td class="hz" style="padding: 10px 14px; text-align: right; opacity: 0.7; width: 80px;">
                                    <p>{{ record.hz }}Hz</p>
                                </td>
                            </tr>
                        </table>
                    </section>
                </div>

                <div v-else class="level-card" style="height: 100%; min-height: 400px; display: flex; justify-content: center; align-items: center; background: var(--bg-secondary, #1e1e24); border-radius: 12px; font-size: 1.5rem;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <div class="meta-container" style="flex: 0 0 300px;">
                <div class="meta" style="background: var(--bg-secondary, #1e1e24); border-radius: 12px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.06);">
                    
                    <div class="errors" v-show="errors.length > 0" style="margin-bottom: 1rem; padding: 10px; background: rgba(255,0,0,0.1); border-left: 3px solid #ff4444; border-radius: 4px;">
                        <p class="error" v-for="error of errors" style="color: #ff6666; font-size: 0.85rem;">{{ error }}</p>
                    </div>

                    <div class="og" style="margin-bottom: 1.5rem; opacity: 0.6; font-size: 0.85rem;">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank" style="text-decoration: underline;">TheShittyList</a></p>
                    </div>

                    <template v-if="editors">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">List Editors</h3>
                        <ol class="editors" style="list-style: none; padding: 0; margin: 0 0 1.5rem 0;">
                            <li v-for="editor in editors" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role" style="width: 16px; height: 16px; opacity: 0.8;">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link" style="text-decoration: none;">{{ editor.name }}</a>
                                <p v-else style="margin: 0; font-size: 0.95rem;">{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

                    <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">Submission Requirements</h3>
                    <div class="rules" style="font-size: 0.85rem; opacity: 0.8; display: flex; flex-direction: column; gap: 8px; line-height: 1.4;">
                        <p>• Achieved without hacks (FPS bypass allowed up to 360fps).</p>
                        <p>• Achieved on the official level ID listed on site.</p>
                        <p>• Includes source audio or click/tap sounds.</p>
                        <p>• Must show completion hit the endwall.</p>
                        <p>• No secret or bug routes permitted.</p>
                        <p>• No easy modes; unmodified levels only.</p>
                        <p>• Cheat indicator required if using tools like MegaHack.</p>
                        <p>• Legitimately verified with proof or witnesses.</p>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected]?.[0];
        },
        video() {
            if (!this.level?.showcase) {
                return embed(this.level?.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
