import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 播放控制：从播放头处开始播放，播放到结尾时停止或从头循环
 * @param setTime 必须是稳定的函数（如 useState 的 setter）
 */
export function usePlayback(duration: number, time: number, setTime: (time: number) => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const timeRef = useRef(time);
  timeRef.current = time;

  useEffect(() => {
    if (!isPlaying) return;
    // 播放中删光了关键帧
    if (duration <= 0) {
      setIsPlaying(false);
      return;
    }
    // 播放头在结尾时从头播放
    const startTime = timeRef.current >= duration ? 0 : timeRef.current;
    const startedAt = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      // rAF 给出的是本帧开始的时间，可能早于上面取的 startedAt，不能让时间变成负数
      const elapsed = startTime + Math.max(0, now - startedAt);
      if (elapsed >= duration && !isLoop) {
        setTime(duration);
        setIsPlaying(false);
        return;
      }
      setTime(elapsed % duration);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, isLoop, duration, setTime]);

  /** 暂停时把播放头对齐到整毫秒，方便在此处添加关键帧 */
  const pause = useCallback(() => {
    setIsPlaying(false);
    setTime(Math.round(timeRef.current));
  }, [setTime]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else if (duration > 0) setIsPlaying(true);
  }, [isPlaying, duration, pause]);

  return { isPlaying, isLoop, setIsLoop, pause, togglePlay };
}
