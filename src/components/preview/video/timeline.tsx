import React, { useRef, useEffect } from "react";
import { a, useSpring } from "react-spring";
import { useDrag } from "@use-gesture/react";
import clamp from "lodash.clamp";
import { pxToPc, pcToPx } from "src/utils/helpers";
import { Handle, AnimatedTime } from "./handle";
import { Frames } from "./frames";

// Bug in fucking safari:

//https://stackoverflow.com/a/50951559
//https://stackoverflow.com/a/18283198

export const Timeline = ({
  src,
  file,
  videoRef,
  duration,
}: {
  src: string;
  file: string;
  videoRef: React.MutableRefObject<HTMLVideoElement>;
  duration: number;
}) => {
  const timelineRef = useRef(null);
  const insideTrackRef = useRef(null);
  const actualTimelineRef = useRef(null);
  const isOn = useRef(false);
  const seeking = useRef(false);
  const seekRef = useRef(null);
  const now = useRef(0);

  // Helpers

  const pxToPcOuter = (px) => pxToPc(px, timelineRef.current.offsetWidth);
  const pcToPxOuter = (pc) => pcToPx(pc, timelineRef.current.offsetWidth);
  const pxToPcInner = (px) => pxToPc(px, insideTrackRef.current.offsetWidth);
  const pcToPxInner = (pc) => pcToPx(pc, insideTrackRef.current.offsetWidth);

  const getStartTime = (nextX) =>
    (((nextX * 100) / timelineRef.current.offsetWidth) * duration) / 100;

  const getEndTime = (xx, w) => {
    const innerXPc = pxToPcInner(xx);
    const outerWidthPx = pcToPxOuter(w);
    const innerWidthPc = pxToPcInner(outerWidthPx - HANDLE_WIDTH * 2);
    const end = ((innerWidthPc + innerXPc) * duration) / 100;
    return end;
  };

  const getSeekToTime = (seekValue) => {
    const time =
      seekValue / (insideTrackRef.current.offsetWidth - BORDER_WIDTH);

    now.current = time;
    return time * duration;
  };

  const seekToTime = (seekValue) => {
    const time = getSeekToTime(seekValue);
    videoRef.current.currentTime = time;
  };

  const onEnd = (e) => {
    let time = videoRef.current.currentTime;
    const end = endTime.get();

    if (time >= end) {
      videoRef.current.pause();
    }
  };

  const moving = () => {
    const video = videoRef.current;
    let time = video?.currentTime;
    const end = endTime.get();
    const start = startTime.get();
    if (isOn.current === true) {
      if (time >= end) {
        let stopped =
          (start * insideTrackRef.current.offsetWidth - 2 * BORDER_WIDTH) /
          duration;
        video.pause();
        seekX.set(stopped);
        return;
      }

      let curr =
        (time * insideTrackRef.current.offsetWidth - 2 * BORDER_WIDTH) /
        duration;

      if (now.current < curr) {
        seekX.set(curr);
        now.current = curr;
      } else {
      }
    }
  };

  const canPlay = () => {
    const loop = () => {
      if (videoRef.current) {
        moving();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const onPlay = () => {
      isOn.current = true;
    };

    const onPause = () => {
      isOn.current = false;
    };

    // videoRef.current.addEventListener("timeupdate", onEnd);
    videoRef.current.addEventListener("canplay", canPlay);
    videoRef.current.addEventListener("play", onPlay);
    videoRef.current.addEventListener("pause", onPause);

    return () => {
      videoRef?.current?.pause();
      videoRef?.current?.removeEventListener("canplay", canPlay);
      // videoRef?.current?.removeEventListener("timeupdate", onEnd);
      videoRef?.current?.removeEventListener("play", onPlay);
      videoRef?.current?.removeEventListener("pause", onPause);
    };
  }, [videoRef]);

  const [
    {
      x,
      width,
      dragging,
      fromVisible,
      toVisible,
      active,
      startTime,
      endTime,
      seekX,
    },
    set,
  ] = useSpring(() => ({
    seekX: 0,
    x: 0,
    width: "100%",
    dragging: false,
    startTime: 0,
    endTime: duration,
    active: false,
    fromVisible: false,
    toVisible: false,
    config: { precision: 0.01 },
    immediate: true,
    onChange: ({ value: { tmpPaused: paused } }) => {},
  }));

  const HANDLE_WIDTH = 28;
  const BORDER_WIDTH = 6;
  const MIN_GAP = 1; // Minimum gap between handles

  const bindSeek = useDrag(
    ({ movement: [mx], first, memo, down }) => {
      videoRef.current.pause();
      if (first) memo = seekX.get();
      const nextx = mx + memo;
      const maxX =
        actualTimelineRef.current.offsetWidth + x.get() - BORDER_WIDTH;
      const nextX = clamp(nextx, x.get(), maxX);

      if (down === true) {
        seeking.current = true;
        seekToTime(nextX);
      } else {
        seekToTime(nextX);
        seeking.current = false;
      }

      set.start({
        seekX: nextX,
        immediate: down,
      });

      return memo;
    },
    {
      axis: "x",
      threshold: 0.2,
    }
  );

  const bindLeft = useDrag(
    ({ movement: [mx], first, memo, down }) => {
      videoRef.current.pause();
      if (first) memo = { width: width.get(), x: x.get() };
      const maxX =
        pcToPxOuter(memo.width.slice(0, -1)) +
        memo.x -
        2 * HANDLE_WIDTH -
        MIN_GAP;
      const nextX = clamp(mx + memo.x, 0, maxX);
      const nextWidth =
        memo.width.slice(0, -1) - pxToPcOuter(nextX - memo.x) + "%";
      const startTime = getStartTime(nextX);

      seekToTime(nextX);

      set.start({
        startTime,
        seekX: nextX,
        x: nextX,
        dragging: down,
        width: nextWidth,
        active: nextX !== 0 || nextWidth !== "100%",
        fromVisible: down,
        immediate: true,
      });
      return memo;
    },
    {
      axis: "x",
    }
  );

  const bindRight = useDrag(
    ({ movement: [ox], first, memo, down }) => {
      videoRef.current.pause();
      if (first) memo = width.get();
      let xx = x.get();
      const maxWidth = pxToPcOuter(timelineRef?.current?.offsetWidth - xx);
      const minWidth = pxToPcOuter(2 * HANDLE_WIDTH + MIN_GAP);
      const w = clamp(memo.slice(0, -1) - pxToPcOuter(-ox), minWidth, maxWidth);
      const nextWidth = w + "%";

      const endTime = getEndTime(xx, w);

      seekToTime(xx);

      set.start({
        endTime,
        seekX: xx,
        dragging: down,
        width: nextWidth,
        active: x.get() !== 0 || nextWidth !== "100%",
        toVisible: down,
        immediate: true,
      });
      return memo;
    },
    {
      axis: "x",
    }
  );

  const bindMiddle = useDrag(
    ({ movement: [mx], down, memo, first }) => {
      videoRef.current.pause();
      if (first) memo = x.get();
      const w = width.get().slice(0, -1);
      const maxX = pcToPxOuter(100) - pcToPxOuter(width.get().slice(0, -1));

      const nextX = clamp(mx + memo, 0, maxX);
      const startTime = getStartTime(nextX);
      const endTime = getEndTime(nextX, w);

      if (down === true) {
        videoRef?.current?.pause();
      }

      seekToTime(nextX);

      set.start({
        seekX: nextX,
        x: nextX,
        startTime,
        endTime,
        dragging: down,
        fromVisible: down,
        toVisible: down,
        immediate: true,
      });
      return memo;
    },
    {
      axis: "x",
    }
  );

  return (
    <div
      className="timeline w-full h-[50px] bg-[#222] rounded-md relative"
      ref={timelineRef}
      data-id="outer"
      style={
        {
          "--handle": `${HANDLE_WIDTH}px`,
          "--timelineborder": `${BORDER_WIDTH}px`,
        } as React.CSSProperties
      }
    >
      <div data-id="inner" className="w-full h-full rounded-md">
        <div
          data-count="1"
          data-id="backtrack"
          className="flex w-full h-full select-none	touch-none"
        >
          <div data-id="2" className="relative w-full h-full touch-none">
            {/* Padding should be border+handle-width */}
            <div
              data-count="3"
              data-id="track"
              className="relative round-sm w-full h-full py-[var(--timelineborder)] px-[var(--handle)] touch-none "
            >
              <div className="relative w-full h-full">
                <div
                  data-id="inside-track"
                  ref={insideTrackRef}
                  className="w-full h-full bg-[#444] relative"
                >
                  <Frames src={file} videoRef={videoRef} />
                </div>
              </div>

              {/* Time / seek */}
              <a.div
                data-id="seek"
                ref={seekRef}
                {...bindSeek()}
                onMouseDown={(e) => videoRef.current.pause()}
                style={{
                  x: seekX,
                  display: dragging.to((isDragging) =>
                    isDragging ? "none" : "block"
                  ),
                }}
                className={`
                touch-none
                top-[calc(var(--timelineborder)-2px)]
                cursor-pointer absolute w-[var(--timelineborder)] h-[calc(100%-var(--timelineborder)*2+4px)] bg-[#fff] rounded-[2px] z-50`}
              />
              {/* Handles */}
              <a.div
                data-id="timeline"
                data-count="7"
                data-active={active}
                className="left-0 absolute top-0 h-full w-full rounded-md border-y-[6px] z-40"
                style={{
                  x,
                  width,
                  borderColor: active.to((active) =>
                    active ? "#ffcd02" : "#222"
                  ),
                }}
              >
                <a.div
                  data-count="8"
                  {...bindMiddle()}
                  className="absolute w-full h-full cursor-grab active:cursor-grabbing flex"
                  data-id="middle"
                >
                  <div className="left-placeholder w-[var(--handle)]"></div>
                  <div
                    ref={actualTimelineRef}
                    className="actual-timeline flex-grow z-50 relative"
                  ></div>
                  <div className="right-placeholder w-[var(--handle)]"></div>
                </a.div>

                <Handle
                  data-id="left"
                  position="left"
                  {...bindLeft()}
                  style={{
                    "--vis": fromVisible.to((active) =>
                      active ? "block" : "none"
                    ),
                    background: active.to((active) =>
                      active ? "#ffcd02" : "#222"
                    ),
                    color: active.to((active) => (active ? "#000" : "#fff")),
                  }}
                >
                  <AnimatedTime time={startTime} />
                </Handle>
                <Handle
                  data-id="right"
                  position="right"
                  {...bindRight()}
                  style={{
                    "--vis": toVisible.to((active) =>
                      active ? "block" : "none"
                    ),
                    background: active.to((active) =>
                      active ? "#ffcd02" : "#222"
                    ),
                    color: active.to((active) => (active ? "#000" : "#fff")),
                  }}
                >
                  <AnimatedTime time={endTime} />
                </Handle>
              </a.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
