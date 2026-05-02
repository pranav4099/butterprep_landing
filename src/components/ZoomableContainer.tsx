import React, { useRef, useState, useCallback, useEffect } from 'react';

interface ZoomableContainerProps {
  children: React.ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
}

const ZoomableContainer: React.FC<ZoomableContainerProps> = ({
  children,
  className = '',
  minScale = 1,
  maxScale = 5,
  doubleTapScale = 2.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const [, forceUpdate] = useState(0);

  const isPinching = useRef(false);
  const isPanning = useRef(false);
  const initialPinchDistance = useRef(0);
  const initialScale = useRef(1);
  const pinchOrigin = useRef({ x: 0, y: 0 }); // pinch center in container coords
  const initialTranslate = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);

  // Velocity tracking for momentum
  const lastPanPos = useRef({ x: 0, y: 0 });
  const lastPanTime = useRef(0);
  const velocity = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(0);

  const applyTransform = useCallback((animate = false) => {
    const el = contentRef.current;
    if (!el) return;
    const s = scaleRef.current;
    const t = translateRef.current;
    el.style.transition = animate ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${s})`;
  }, []);

  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return { x: tx, y: ty };

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const contentW = cw * s;
    const contentH = content.scrollHeight * s;

    const maxX = Math.max(0, (contentW - cw) / 2);
    const maxY = Math.max(0, (contentH - ch) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, tx)),
      y: Math.min(maxY, Math.max(-maxY, ty)),
    };
  }, []);

  const getDistance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (t1: Touch, t2: Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  // Zoom toward a specific point (in container-local coords)
  const zoomToPoint = useCallback((newScale: number, pointX: number, pointY: number, oldScale: number, oldTx: number, oldTy: number) => {
    // The point under the finger should stay fixed:
    // pointX = containerCenterX + (contentPointX * scale + tx)
    // Solving: tx_new = tx_old - (pointX - containerW/2) * (newScale/oldScale - 1)
    const container = containerRef.current;
    if (!container) return { x: oldTx, y: oldTy };

    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;

    const ratio = newScale / oldScale;
    const tx = oldTx - (pointX - cx - oldTx) * (ratio - 1);
    const ty = oldTy - (pointY - cy - oldTy) * (ratio - 1);

    return clampTranslate(tx, ty, newScale);
  }, [clampTranslate]);

  const stopMomentum = useCallback(() => {
    cancelAnimationFrame(momentumRaf.current);
    velocity.current = { x: 0, y: 0 };
  }, []);

  const startMomentum = useCallback(() => {
    const friction = 0.95;
    const minVelocity = 0.5;

    const tick = () => {
      const vx = velocity.current.x * friction;
      const vy = velocity.current.y * friction;

      if (Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity) {
        velocity.current = { x: 0, y: 0 };
        return;
      }

      velocity.current = { x: vx, y: vy };
      translateRef.current = clampTranslate(
        translateRef.current.x + vx,
        translateRef.current.y + vy,
        scaleRef.current
      );
      applyTransform(false);
      momentumRaf.current = requestAnimationFrame(tick);
    };

    momentumRaf.current = requestAnimationFrame(tick);
  }, [clampTranslate, applyTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      stopMomentum();

      if (e.touches.length === 2) {
        isPinching.current = true;
        isPanning.current = false;
        initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
        initialScale.current = scaleRef.current;
        initialTranslate.current = { ...translateRef.current };

        // Store pinch center in container-local coords
        const rect = el.getBoundingClientRect();
        const mid = getMidpoint(e.touches[0], e.touches[1]);
        pinchOrigin.current = { x: mid.x - rect.left, y: mid.y - rect.top };

        e.preventDefault();
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          e.preventDefault();
          lastTap.current = 0;

          const rect = el.getBoundingClientRect();
          const tapX = e.touches[0].clientX - rect.left;
          const tapY = e.touches[0].clientY - rect.top;

          if (scaleRef.current > 1.1) {
            scaleRef.current = 1;
            translateRef.current = { x: 0, y: 0 };
          } else {
            const newT = zoomToPoint(doubleTapScale, tapX, tapY, scaleRef.current, translateRef.current.x, translateRef.current.y);
            scaleRef.current = doubleTapScale;
            translateRef.current = newT;
          }
          applyTransform(true);
          forceUpdate(n => n + 1);
          return;
        }
        lastTap.current = now;

        if (scaleRef.current > 1.05) {
          isPanning.current = true;
          panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          translateStart.current = { ...translateRef.current };
          lastPanPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          lastPanTime.current = now;
          e.preventDefault();
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isPinching.current && e.touches.length === 2) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const ratio = dist / initialPinchDistance.current;
        const newScale = Math.min(maxScale, Math.max(minScale, initialScale.current * ratio));

        // Zoom centered on the original pinch midpoint
        const rect = el.getBoundingClientRect();
        const mid = getMidpoint(e.touches[0], e.touches[1]);
        const currentMid = { x: mid.x - rect.left, y: mid.y - rect.top };

        // Compute new translate: zoom toward original pinch origin + pan delta
        const newT = zoomToPoint(newScale, pinchOrigin.current.x, pinchOrigin.current.y, initialScale.current, initialTranslate.current.x, initialTranslate.current.y);
        // Also add the finger pan offset
        const panDx = currentMid.x - pinchOrigin.current.x;
        const panDy = currentMid.y - pinchOrigin.current.y;

        scaleRef.current = newScale;
        translateRef.current = clampTranslate(newT.x + panDx, newT.y + panDy, newScale);

        cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => applyTransform(false));
      } else if (isPanning.current && e.touches.length === 1) {
        e.preventDefault();
        const now = Date.now();
        const dx = e.touches[0].clientX - panStart.current.x;
        const dy = e.touches[0].clientY - panStart.current.y;

        // Track velocity
        const dt = now - lastPanTime.current;
        if (dt > 0) {
          velocity.current = {
            x: (e.touches[0].clientX - lastPanPos.current.x) / dt * 16,
            y: (e.touches[0].clientY - lastPanPos.current.y) / dt * 16,
          };
        }
        lastPanPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastPanTime.current = now;

        translateRef.current = clampTranslate(
          translateStart.current.x + dx,
          translateStart.current.y + dy,
          scaleRef.current
        );

        cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => applyTransform(false));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) isPinching.current = false;
      if (e.touches.length < 1) {
        if (isPanning.current) {
          isPanning.current = false;
          // Start momentum if there's velocity
          if (Math.abs(velocity.current.x) > 1 || Math.abs(velocity.current.y) > 1) {
            startMomentum();
          }
        }
      }

      // Snap back if below min
      if (scaleRef.current < 1.05 && !isPinching.current) {
        scaleRef.current = 1;
        translateRef.current = { x: 0, y: 0 };
        applyTransform(true);
      }
      // Elastic snap if above max
      if (scaleRef.current > maxScale && !isPinching.current) {
        scaleRef.current = maxScale;
        translateRef.current = clampTranslate(translateRef.current.x, translateRef.current.y, maxScale);
        applyTransform(true);
      }
      forceUpdate(n => n + 1);
    };

    // Mouse wheel zoom for desktop
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const pointX = e.clientX - rect.left;
      const pointY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(maxScale, Math.max(minScale, scaleRef.current * zoomFactor));

      const newT = zoomToPoint(newScale, pointX, pointY, scaleRef.current, translateRef.current.x, translateRef.current.y);
      scaleRef.current = newScale;
      translateRef.current = newT;

      applyTransform(false);
      forceUpdate(n => n + 1);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(momentumRaf.current);
    };
  }, [minScale, maxScale, doubleTapScale, applyTransform, clampTranslate, zoomToPoint, stopMomentum, startMomentum]);

  const isZoomed = scaleRef.current > 1.05;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        touchAction: isZoomed ? 'none' : 'pan-y',
        overflow: isZoomed ? 'hidden' : 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        ref={contentRef}
        style={{
          transformOrigin: 'center top',
          willChange: 'transform',
          transform: `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ZoomableContainer;
