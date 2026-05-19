export function initBgParallax() {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) return;

    const circles = document.querySelector('.bg-circles') as HTMLElement | null;
    const texture = document.querySelector('.bg-texture') as HTMLElement | null;
    const textBlock = document.querySelector('.hero-text') as HTMLElement | null;

    if (!circles || !texture || !textBlock) return;

    let rafBg = 0;
    let tx = 0,
        ty = 0;
    let cx = 0,
        cy = 0;

    document.addEventListener('mousemove', (e: MouseEvent) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
        cancelAnimationFrame(rafBg);
        rafBg = requestAnimationFrame(tickBg);
    });

    function tickBg() {
        cx += (tx - cx) * 0.07;
        cy += (ty - cy) * 0.07;

        circles!.style.transform = `translate(${cx * -20}px, ${cy * -14}px)`;
        texture!.style.transform = `translate(${cx * -10}px, ${cy * -7}px)`;
        textBlock!.style.transform = `translate(${cx * 6}px, ${cy * 3}px)`;

        if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
            rafBg = requestAnimationFrame(tickBg);
        }
    }
}
