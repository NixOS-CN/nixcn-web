export function initNixflakeAnimation() {
    // ─── Canvas: NixOS snowflake — single SVG tile, drawn 78 times ──
    //
    // Strategy: each of the 78 tiles renders the SAME mini-snowflake SVG
    // at its home position. Spring physics repels tiles from the cursor
    // and springs them back. Per Figma source (node 23:289 etc.) all 78
    // tiles use the same image at the same orientation — the arms only
    // look angled because the tile positions are arranged along 6 lines
    // at 60° intervals. No per-tile rotation needed.
    //
    // Coordinate derivation:
    //   Raw relX/relY come from tile.absoluteTransform − logoFrame.x (684)
    //   Desktop-2 page-abs position: x=1319, y=−36
    //   Logo frame within Desktop-2: x=684, y=139 → size 863×856 px
    //
    //   tile position IN logo frame:
    //     x_wl = relX − 1319       (since: absX = 1319 + 684 + x_wl, relX = absX − 684)
    //     y_wl = relY + 36          (since: absY = −36 + 139 + y_wl, relY = absY − 139)
    //
    //   Canvas logical size: 700×700 px → fills the right column + overflows right
    //   Canvas scale vs Figma: CS = 700/863 ≈ 0.811
    //
    const canvas = document.getElementById('nixflake') as HTMLCanvasElement | null;
    if (!canvas) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = 700;
    const H = 700;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(DPR, DPR);

    // Figma logo frame dimensions
    const LFW = 863;
    // Scale factor: canvas px per Figma unit
    const CS = W / LFW; // ≈ 0.811
    // Tile pitch in Figma units (from Figma rect dimensions). Used to
    // anchor RAW coordinates; tile rendering itself is square below.
    const TW_F = 39.7;
    const TH_F = 36.5;
    // Tile dest size on canvas — SQUARE so the hexagonally-symmetric
    // mini-snowflake has equal margin on all sides (no horizontal
    // squash that made arms look uneven). Use the larger of the two
    // Figma dimensions so the glyph keeps its natural size.
    const DS = TW_F * CS; // ≈ 32.2 px (square edge)
    // SVG viewBox is now 530×530 (was 530×456). The snowflake glyph
    // occupies the central 530×455 band → 2.3px transparent padding
    // top + bottom when drawn at DS×DS. Shift hy up by half the
    // height increase so the snowflake's visual center stays at the
    // exact same canvas position as before.
    const HY_SHIFT = (DS - TH_F * CS) / 2; // ≈ 1.3 px

    // Nix flake = Star of David (hexagram): two overlapping equilateral
    // triangles. Each triangle contributes 3 bars (= triangle edges),
    // and the 6 bars are shifted SHIFT units along their triangle's CCW
    // edge direction. This shift is what creates the characteristic
    // 6-pointed star — bars from the two triangles cross at the 6
    // outer star tips, giving the design its 6-fold rotational symmetry.
    //
    // Each bar is 9 main tiles (along its edge) plus a 4-tile branch
    // extending outward from the bar midpoint, rotated 60° (Figma
    // matrix [cos60, -sin60; sin60, cos60]) from the bar direction.
    //
    // Geometry derived from the Figma source — bar center spacing,
    // shift, and branch direction all match the original to within
    // sub-pixel tolerance. We regenerate (instead of using the raw
    // Figma coords) only to even out 2% variance between horizontal
    // sides (PITCH ≈ 38.96) and diagonal sides (PITCH ≈ 39.6), and to
    // make SHIFT identical across all 6 bars (Figma source varied 92–100).
    // Hexagram center in RAW coord space, chosen so the snowflake
    // visually centers at (W/2, H/2) on canvas. Derived from the
    // inverse of the (rx, ry) → (hx, hy) transform below:
    //   STAR_C_X = (W/2) / CS + 1319 = 350/0.8112 + 1319 ≈ 1750.5
    //   STAR_C_Y = (H/2 + HY_SHIFT) / CS − 36 ≈ 396.9
    const STAR_C_X = 1750.5;
    const STAR_C_Y = 396.9;
    const STAR_R = 388.8; // triangle circumradius (vertex distance from center)
    const STAR_PITCH = 39; // main-bar tile-to-tile spacing
    const STAR_BRANCH_PITCH = 41; // branch tile-to-tile spacing
    // Bar offset along its triangle's CCW edge direction.
    //
    // For the 6 outer star tips (branch outermost tiles) to land on a
    // proper AXIS-ALIGNED regular hexagon (flat-top, horizontal top/
    // bottom edges), this offset must equal R·√3/6. Derivation: pick
    // the leftmost tip (UP-1 bar's branch end). Its y component
    // relative to center is R/4 − SHIFT·√3/2. Setting that to 0
    // (tip exactly on the horizontal axis) gives SHIFT = R/(2√3) =
    // R·√3/6. The other 5 tips then fall at 60° intervals around
    // a circle of radius R·√3/3 + 4·BRANCH_PITCH, by symmetry.
    //
    // (The Figma source used SHIFT ≈ 96, which gives a hex rotated
    // ~2° off-axis. We use the exact value to make the outer hex
    // perfectly axis-aligned.)
    const STAR_SHIFT = (STAR_R * Math.sqrt(3)) / 6; // ≈ 112.24

    // 6 edges, identified by their two endpoint vertex angles (math y-up).
    // Upward triangle CCW: v90 → v210 → v330 → v90.
    // Downward triangle CCW: v30 → v150 → v270 → v30.
    const STAR_EDGES: { v_from_deg: number; v_to_deg: number }[] = [
        { v_from_deg: 90, v_to_deg: 210 }, // UP-1
        { v_from_deg: 210, v_to_deg: 330 }, // UP-2 (horizontal, bottom of upward triangle)
        { v_from_deg: 330, v_to_deg: 90 }, // UP-3
        { v_from_deg: 30, v_to_deg: 150 }, // DN-1 (horizontal, top of downward triangle)
        { v_from_deg: 150, v_to_deg: 270 }, // DN-2
        { v_from_deg: 270, v_to_deg: 30 }, // DN-3
    ];

    const COS60 = 0.5;
    const SIN60 = Math.sqrt(3) / 2;

    const RAW: { tiles: [number, number][]; isLight: boolean }[] = STAR_EDGES.map(
        ({ v_from_deg, v_to_deg }, edgeIdx) => {
            const a1 = (v_from_deg * Math.PI) / 180;
            const a2 = (v_to_deg * Math.PI) / 180;
            // Triangle vertices (math y-up → Figma y-down: flip y).
            const vfx = STAR_C_X + STAR_R * Math.cos(a1);
            const vfy = STAR_C_Y - STAR_R * Math.sin(a1);
            const vtx = STAR_C_X + STAR_R * Math.cos(a2);
            const vty = STAR_C_Y - STAR_R * Math.sin(a2);
            // Edge midpoint and CCW direction along the edge.
            const Mx = (vfx + vtx) / 2;
            const My = (vfy + vty) / 2;
            const ex = vtx - vfx;
            const ey = vty - vfy;
            const elen = Math.sqrt(ex * ex + ey * ey);
            const dx = ex / elen;
            const dy = ey / elen;
            // Bar midpoint = edge midpoint shifted SHIFT units along d.
            const bcx = Mx + STAR_SHIFT * dx;
            const bcy = My + STAR_SHIFT * dy;
            // Branch direction = bar dir rotated 60° in Figma (matrix
            // [cos60, -sin60; sin60, cos60]). Verified to match the Figma
            // source's branch directions across all 6 bars.
            const bdx = dx * COS60 - dy * SIN60;
            const bdy = dx * SIN60 + dy * COS60;

            const tiles: [number, number][] = [];
            // 9 main bar tiles, centered on bar midpoint, j=0..8 along d.
            for (let j = 0; j < 9; j++) {
                const cx = bcx + (j - 4) * STAR_PITCH * dx;
                const cy = bcy + (j - 4) * STAR_PITCH * dy;
                tiles.push([cx - TW_F / 2, cy - TH_F / 2]);
            }
            // 4 branch tiles extending out from bar midpoint.
            for (let k = 1; k <= 4; k++) {
                const cx = bcx + k * STAR_BRANCH_PITCH * bdx;
                const cy = bcy + k * STAR_BRANCH_PITCH * bdy;
                tiles.push([cx - TW_F / 2, cy - TH_F / 2]);
            }
            // Each bar gets ONE color (dark or light) — uniform across its
            // 9 main + 4 branch tiles. The split matches the canonical
            // Nix flake logo (public/images/shared/nix-flake-logo.svg), whose 6
            // lambdas alternate around flat-top hex positions:
            //   DARK  at math 0° / 120° / 240°
            //   LIGHT at math 60° / 180° / 300°
            // Our bar midpoints (after STAR_SHIFT) land exactly on those
            // 6 hex positions, with a clean triangle correspondence:
            //   indices 0–2 (UP-*, upward triangle)   → hit 60° / 180° / 300° → LIGHT
            //   indices 3–5 (DN-*, downward triangle) → hit 0° / 120° / 240° → DARK
            // We can't use a bar-midpoint-Y vs center-Y test because
            // UP-1 (180°) and DN-3 (0°) both sit exactly on the
            // horizontal axis — a Y comparison misclassifies them.
            const isLight = edgeIdx < 3;
            return { tiles, isLight };
        },
    );

    interface Tile {
        hx: number;
        hy: number;
        ox: number;
        oy: number;
        vx: number;
        vy: number;
        isLight: boolean;
    }

    const tiles: Tile[] = [];
    for (const { tiles: groupTiles, isLight } of RAW) {
        for (const [rx, ry] of groupTiles) {
            const x_wl = rx - 1319;
            const y_wl = ry + 36;
            tiles.push({
                hx: x_wl * CS,
                hy: y_wl * CS - HY_SHIFT,
                ox: 0,
                oy: 0,
                vx: 0,
                vy: 0,
                isLight,
            });
        }
    }

    // Single clean mini-snowflake SVG, pre-rasterized ONCE to an
    // offscreen bitmap. The SVG contains multi-layer drop-shadow +
    // inner-shadow + Gaussian-blur filter chains; drawing it directly
    // 78× per frame forces the browser to re-run the entire filter
    // pipeline on every drawImage call → tanks performance.
    // Pre-rasterizing collapses each per-frame tile draw to a cheap
    // bitmap copy.
    const img = new Image();
    img.src = '/images/shared/nix-tile-100.svg';

    // Offscreen bitmap dimensioning targets a "soft fog"
    // shadow rather than a sharp cast shadow:
    //   - Larger BMP → SVG's stdDev=5 Gaussian blur survives
    //     more downscale → shadow spreads SOFTER over a
    //     WIDER area (looks blurrier).
    //   - Lower globalAlpha → each pixel of that wider
    //     spread is more transparent → looks LIGHTER.
    // The two compensate so total shadow "ink" stays modest
    // but the shadow's visual radius grows.
    //
    // Letterbox keeps the SVG's 1.156:1 hexagram aspect.
    const SVG_W = 520;
    const SVG_H = 450;
    const SVG_RATIO = SVG_W / SVG_H;
    // SCALE 5.5 → BMP ≈ 355 px → SVG downscale ~1.46× →
    // stdDev=5 blurs render at ~3.4 px (vs ~2.5 at SCALE=4)
    // — softer, broader penumbra without the SVG-native
    // overweight you get at full SVG resolution.
    const TILE_BMP_SCALE = 5.5;
    const BMP_SIZE = Math.ceil(DS * DPR * TILE_BMP_SCALE);
    const SVG_DRAW_W = BMP_SIZE;
    const SVG_DRAW_H = BMP_SIZE / SVG_RATIO;
    const SVG_DRAW_Y = (BMP_SIZE - SVG_DRAW_H) / 2;
    const bmpDark = document.createElement('canvas');
    bmpDark.width = BMP_SIZE;
    bmpDark.height = BMP_SIZE;
    const bmpLight = document.createElement('canvas');
    bmpLight.width = BMP_SIZE;
    bmpLight.height = BMP_SIZE;

    // Shadow strategy: instead of a uniform CSS drop-shadow
    // (single tint, fully alpha-driven) we cast a SOFT BLURRED
    // COPY of the SVG itself. Because the bitmap retains the
    // SVG's per-path color, deep-blue arms (#64AEE0 at
    // fill-opacity 0.8) naturally cast a stronger, deeper
    // shadow than the pale arms (#D5ECF9) — matches the
    // physical intuition "opaque blocks light, translucent
    // lets it through" without having to hack fill-opacity.
    //
    // Padding: ctx.filter='blur(r)' spreads pixels by ~3r
    // beyond the source bounds; we pad the shadow bitmap so
    // the halo isn't clipped at tile edges.
    const SHADOW_BLUR_BMP = 28;
    const SHADOW_PAD_BMP = SHADOW_BLUR_BMP * 4;
    const bmpShadow = document.createElement('canvas');
    bmpShadow.width = BMP_SIZE + SHADOW_PAD_BMP * 2;
    bmpShadow.height = BMP_SIZE + SHADOW_PAD_BMP * 2;
    let bmpReady = false;

    function buildBitmaps() {
        const dctx = bmpDark.getContext('2d')!;
        const lctx = bmpLight.getContext('2d')!;
        const sctx = bmpShadow.getContext('2d')!;
        dctx.clearRect(0, 0, BMP_SIZE, BMP_SIZE);
        lctx.clearRect(0, 0, BMP_SIZE, BMP_SIZE);
        sctx.clearRect(0, 0, bmpShadow.width, bmpShadow.height);

        // Foreground bitmaps — small main-arm tint difference
        // only. The shadow story is told by bmpShadow below,
        // not by globalAlpha here.
        dctx.globalAlpha = 0.85;
        dctx.drawImage(img, 0, SVG_DRAW_Y, SVG_DRAW_W, SVG_DRAW_H);
        lctx.globalAlpha = 0.62;
        lctx.drawImage(img, 0, SVG_DRAW_Y, SVG_DRAW_W, SVG_DRAW_H);

        // Shadow bitmap: same SVG, drawn ONCE with a
        // gaussian blur via ctx.filter and reduced alpha,
        // shifted into the bitmap by SHADOW_PAD_BMP so the
        // halo has room to bleed in every direction.
        sctx.filter = `blur(${SHADOW_BLUR_BMP}px)`;
        sctx.globalAlpha = 0.6;
        sctx.drawImage(img, SHADOW_PAD_BMP, SHADOW_PAD_BMP + SVG_DRAW_Y, SVG_DRAW_W, SVG_DRAW_H);
        sctx.filter = 'none';

        bmpReady = true;
    }

    // Shadow offset on the main canvas (right-down). Sized
    // relative to the tile so the offset scales with DS.
    const SHADOW_OFF_X = DS * 0.32;
    const SHADOW_OFF_Y = DS * 0.44;
    // SHADOW_PAD_BMP in canvas px (bmpShadow's BMP_SIZE region
    // covers DS canvas px, so pad converts at the same ratio).
    const SHADOW_PAD_PX = (SHADOW_PAD_BMP / BMP_SIZE) * DS;
    const SHADOW_DRAW_SIZE = DS + SHADOW_PAD_PX * 2;

    const SPRING = 0.09;
    const DAMPING = 0.72;
    const REPEL_R = 90;
    const REPEL_F = 6000;

    let mxC = -9999;
    let myC = -9999;

    function syncPointer(clientX: number, clientY: number) {
        const rect = canvas!.getBoundingClientRect();
        mxC = (clientX - rect.left) * (W / rect.width);
        myC = (clientY - rect.top) * (H / rect.height);
    }

    document.addEventListener('mousemove', (e: MouseEvent) => {
        syncPointer(e.clientX, e.clientY);
    });
    canvas.addEventListener('mouseleave', () => {
        mxC = -9999;
    });

    // Touch 输入（手机 / 平板）。全局 passive 监听，绝不
    // preventDefault —— 否则会破坏页面纵向滚动。手指抬起 /
    // 取消时把指针拉到极远处，让 spring 自然把雪花拉回原位。
    const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) syncPointer(t.clientX, t.clientY);
    };
    const releaseTouch = () => {
        mxC = -9999;
    };
    document.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('touchend', releaseTouch, { passive: true });
    document.addEventListener('touchcancel', releaseTouch, { passive: true });

    let rafId = 0;
    function tick() {
        ctx.clearRect(0, 0, W, H);

        // Pass 1: physics update (spring + cursor repulsion).
        for (const tile of tiles) {
            tile.vx += -tile.ox * SPRING;
            tile.vy += -tile.oy * SPRING;

            if (mxC > -100) {
                const tcx = tile.hx + DS / 2 + tile.ox;
                const tcy = tile.hy + DS / 2 + tile.oy;
                const dx = tcx - mxC;
                const dy = tcy - myC;
                const d2 = dx * dx + dy * dy;
                if (d2 < REPEL_R * REPEL_R && d2 > 0.25) {
                    const d = Math.sqrt(d2);
                    const f = REPEL_F / d2;
                    tile.vx += (dx / d) * f;
                    tile.vy += (dy / d) * f;
                }
            }

            tile.vx *= DAMPING;
            tile.vy *= DAMPING;
            tile.ox += tile.vx;
            tile.oy += tile.vy;
        }

        if (bmpReady) {
            // Pass 2: paint ALL shadows first, right-down
            // offset. Doing this before any foreground means
            // a tile's shadow can correctly slide under its
            // right-down neighbor's body instead of being
            // overpainted by that neighbor's own shadow.
            for (const tile of tiles) {
                ctx.drawImage(
                    bmpShadow,
                    tile.hx + tile.ox + SHADOW_OFF_X - SHADOW_PAD_PX,
                    tile.hy + tile.oy + SHADOW_OFF_Y - SHADOW_PAD_PX,
                    SHADOW_DRAW_SIZE,
                    SHADOW_DRAW_SIZE,
                );
            }

            // Pass 3: paint all sharp foregrounds on top.
            for (const tile of tiles) {
                ctx.drawImage(tile.isLight ? bmpLight : bmpDark, tile.hx + tile.ox, tile.hy + tile.oy, DS, DS);
            }
        }

        rafId = requestAnimationFrame(tick);
    }

    img.onload = () => {
        buildBitmaps();
        cancelAnimationFrame(rafId);
        tick();
    };
    if (img.complete && img.naturalWidth > 0) {
        buildBitmaps();
        tick();
    } else {
        tick();
    }
}
