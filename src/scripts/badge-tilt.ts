// Nix badge: 3D tilt + 光泽追踪（仅鼠标 / 触控笔等精确指针）
//
// 效果：徽章的"正面法线"始终指向指针 —— 指针在徽章右上方时，
// 徽章右上角往前凸（rotateY 正、rotateX 负），整体像被指针"吸引"
// 而面向它转动。同时一个软高光斑跟着指针在徽章表面上滑动，
// 进一步强化 3D 玻璃药丸的观感。
//
// 仅响应鼠标：触屏滑动也会触发 pointermove，会让徽章跟着滚走。
// 不用 pointer:coarse 整段禁用，避免触屏笔记本在桌面宽度下丢失鼠标 3D 效果。
export function initBadgeTilt() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nixBadge = document.querySelector('.nix-highlight') as HTMLElement | null;
    if (!nixBadge || prefersReducedMotion) return;

    const MAX_ROT_Y = 18;
    const MAX_ROT_X = 14;
    const LIFT_BASE = 6;
    const LIFT_AMP = 10;
    const RANGE = 360;
    const SMOOTH = 0.14;
    const REST_GX = 0.3;
    const REST_GY = 0.25;

    let tgtX = 0;
    let tgtY = 0;
    let curX = 0;
    let curY = 0;
    let tgtGX = REST_GX;
    let tgtGY = REST_GY;
    let curGX = REST_GX;
    let curGY = REST_GY;
    let rafBadge = 0;

    const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

    function scheduleTick() {
        if (!rafBadge) rafBadge = requestAnimationFrame(tickBadge);
    }

    function onMove(e: PointerEvent) {
        if (e.pointerType !== 'mouse') return;

        const rect = nixBadge!.getBoundingClientRect();
        const cxB = rect.left + rect.width / 2;
        const cyB = rect.top + rect.height / 2;
        const dx = e.clientX - cxB;
        const dy = e.clientY - cyB;
        tgtX = clamp(dx / RANGE, -1, 1);
        tgtY = clamp(dy / RANGE, -1, 1);

        const localX = (e.clientX - rect.left) / rect.width;
        const localY = (e.clientY - rect.top) / rect.height;
        tgtGX = clamp(localX, -0.2, 1.2);
        tgtGY = clamp(localY, -0.2, 1.2);

        scheduleTick();
    }

    function onPointerEnd(e: PointerEvent) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            tgtX = 0;
            tgtY = 0;
            tgtGX = REST_GX;
            tgtGY = REST_GY;
            scheduleTick();
        }
    }

    function tickBadge() {
        curX += (tgtX - curX) * SMOOTH;
        curY += (tgtY - curY) * SMOOTH;
        curGX += (tgtGX - curGX) * SMOOTH;
        curGY += (tgtGY - curGY) * SMOOTH;

        const rotY = curX * MAX_ROT_Y;
        const rotX = -curY * MAX_ROT_X;
        const lift = LIFT_BASE + (Math.abs(curX) + Math.abs(curY)) * LIFT_AMP;

        nixBadge!.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(
            2,
        )}deg) translateZ(${lift.toFixed(2)}px)`;
        nixBadge!.style.setProperty('--gloss-x', `${(curGX * 100).toFixed(1)}%`);
        nixBadge!.style.setProperty('--gloss-y', `${(curGY * 100).toFixed(1)}%`);

        if (
            Math.abs(tgtX - curX) > 0.0008 ||
            Math.abs(tgtY - curY) > 0.0008 ||
            Math.abs(tgtGX - curGX) > 0.001 ||
            Math.abs(tgtGY - curGY) > 0.001
        ) {
            rafBadge = requestAnimationFrame(tickBadge);
        } else {
            rafBadge = 0;
        }
    }

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerup', onPointerEnd, { passive: true });
    document.addEventListener('pointercancel', onPointerEnd, { passive: true });
}
