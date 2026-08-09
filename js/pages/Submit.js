export default {
    template: `
        <main class="page-submit" style="display: flex; justify-content: center; align-items: center; padding: 2rem 1rem; width: 100%;">
            <div class="submit-card" style="
                width: 100%;
                max-width: 760px;
                background: var(--bg-secondary, #1e1e24);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.08);
                overflow: hidden;
                padding: 1rem 0;
            ">
                <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLSdDLB3Mi1GgCxOC3bk0ZVJzHPB9K76z3dAsg7t3ytc_saFGTQ/viewform?embedded=true" 
                    width="100%" 
                    height="850" 
                    frameborder="0" 
                    marginheight="0" 
                    marginwidth="0"
                    style="border: none; display: block;"
                >Loading…</iframe>
            </div>
        </main>
    `
};
