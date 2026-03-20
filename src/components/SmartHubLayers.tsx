"use client";

import { motion } from "framer-motion";
import {
  type CSSProperties,
  Fragment,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type ManagedBy = "org" | "provider";

export type Layer = { id: string; name: string };

export type LineData = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isProvider: boolean;
  index: number;
  merged?: boolean;
};

export type SmartHubLayersColumn = {
  managedBy: ManagedBy[];
};

export const LAYERS: Layer[] = [
  { id: "app", name: "Application" },
  { id: "plat", name: "Platforms" },
  { id: "virt", name: "Virtualization" },
  { id: "net", name: "Server, Storage, Network" },
  { id: "dc", name: "Data center" },
];

const LAYERS_CARD_TITLE_BAR: CSSProperties = {
  width: "100%",
  maxWidth: 494.97894287109375,
  height: 42.58415603637695,
  borderRadius: 8,
  paddingTop: 4,
  paddingRight: 16,
  paddingBottom: 4,
  paddingLeft: 16,
  boxSizing: "border-box",
  color: "rgba(255, 255, 255, 1)",
  background:
    "linear-gradient(90deg, rgba(5, 11, 34, 0.5) 0%, rgba(21, 42, 136, 0.5) 100%)",
};

const BEZIER_STRAIGHT_FRACTION = 0.6;

function buildBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = x2 - x1;
  const t = BEZIER_STRAIGHT_FRACTION;
  const cpX = x1 + dx * t;
  return `M${x1},${y1} C${cpX},${y1} ${cpX},${y2} ${x2},${y2}`;
}

function buildSoftBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const cx = (x2 - x1) * 0.25;
  return `M${x1},${y1} C${x1 + cx},${y1} ${x2 - cx},${y2} ${x2},${y2}`;
}

function buildMergeToLabelPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = x2 - x1;
  const t = BEZIER_STRAIGHT_FRACTION;
  const cpX = x1 + dx * t;
  return `M${x1},${y1} C${cpX},${y1} ${cpX},${y2} ${x2},${y2}`;
}

function buildGentleMergeToLabelPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  controlX?: number,
): string {
  const midX = controlX ?? (x1 + x2) / 2;
  return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
}

/**
 * Org label → Application (last column, single org): straight horizontal for ~⅓ of the
 * gap, then a smooth S (cubic) with horizontal arrival at the pill — matches sketch.
 */
function buildLastColumnOrgLabelFirstPath(
  labelX: number,
  labelY: number,
  pillX: number,
  pillY: number,
): string {
  const dx = pillX - labelX;
  const straightFrac = 1 / 3;
  const hx = labelX + dx * straightFrac;
  const dxCurve = pillX - hx;
  const handleT = 0.45;
  const cp1x = hx + dxCurve * handleT;
  const cp2x = pillX - dxCurve * handleT;
  return `M${labelX},${labelY} L${hx},${labelY} C${cp1x},${labelY} ${cp2x},${pillY} ${pillX},${pillY}`;
}

function useLineCalculation(
  col: SmartHubLayersColumn,
  containerRef: RefObject<HTMLDivElement>,
  pillRefs: RefObject<(HTMLDivElement | null)[]>,
  orgLabelRef: RefObject<HTMLSpanElement>,
  providerLabelRef: RefObject<HTMLSpanElement>,
  isLastColumn?: boolean,
) {
  const [lines, setLines] = useState<LineData[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);

  const calculate = useCallback(() => {
    if (!containerRef.current) return;

    const cr = containerRef.current.getBoundingClientRect();
    if (cr.width === 0 || cr.height === 0) return;

    setSvgSize((prev) =>
      prev.w === cr.width && prev.h === cr.height
        ? prev
        : { w: cr.width, h: cr.height },
    );

    const rawOrg: LineData[] = [];
    const rawProvider: LineData[] = [];

    LAYERS.forEach((_, i) => {
      const pillEl = pillRefs.current?.[i];
      const isProvider = col.managedBy[i] === "provider";
      const labelEl = isProvider
        ? providerLabelRef.current
        : orgLabelRef.current;
      if (!pillEl || !labelEl) return;

      const pr = pillEl.getBoundingClientRect();
      const lr = labelEl.getBoundingClientRect();

      const pillCenterY = pr.top + pr.height / 2 - cr.top;
      const labelCenterY = lr.top + lr.height / 2 - cr.top;

      const pillIsLeft = pr.left < lr.left;

      const x1 = pillIsLeft ? pr.right - cr.left : pr.left - cr.left;
      const x2 = pillIsLeft ? lr.left - cr.left : lr.right - cr.left;

      const entry: LineData = {
        x1,
        y1: pillCenterY,
        x2,
        y2: labelCenterY,
        isProvider,
        index: i,
      };

      if (isProvider) rawProvider.push(entry);
      else rawOrg.push(entry);
    });

    const buildMergedGroup = (
      group: LineData[],
      isProvider: boolean,
    ): LineData[] => {
      if (group.length === 0) return [];

      const avgPillX = group.reduce((sum, l) => sum + l.x1, 0) / group.length;
      const labelX = group[0].x2;
      const labelY = group[0].y2;

      const minY = Math.min(...group.map((l) => l.y1));
      const maxY = Math.max(...group.map((l) => l.y1));

      const mergeX =
        !isProvider && isLastColumn && group.length === 1
          ? (avgPillX + labelX) / 2
          : avgPillX + (labelX - avgPillX) * 0.6;
      const mergeY = isProvider ? labelY : (minY + maxY) / 2;

      const toMerge = group.map((l) => ({
        ...l,
        x2: mergeX,
        y2: mergeY,
        merged: true,
      }));

      const mergeToLabel: LineData = {
        x1: mergeX,
        y1: mergeY,
        x2: labelX,
        y2: labelY,
        isProvider,
        index: 1000 + (isProvider ? 1 : 0),
        merged: true,
      };

      return [...toMerge, mergeToLabel];
    };

    const mergedOrg = buildMergedGroup(rawOrg, false);
    const mergedProvider = buildMergedGroup(rawProvider, true);

    setLines(
      [...mergedOrg, ...mergedProvider].sort((a, b) => a.index - b.index),
    );
  }, [
    col,
    containerRef,
    pillRefs,
    orgLabelRef,
    providerLabelRef,
    isLastColumn,
  ]);

  const recalculate = useCallback(() => {
    if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
    if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);

    raf1Ref.current = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(() => {
        calculate();
      });
    });
  }, [calculate]);

  useLayoutEffect(() => {
    recalculate();

    const ro = new ResizeObserver(() => recalculate());

    if (containerRef.current) ro.observe(containerRef.current);
    pillRefs.current?.forEach((el) => {
      if (el) ro.observe(el);
    });
    if (orgLabelRef.current) ro.observe(orgLabelRef.current);
    if (providerLabelRef.current) ro.observe(providerLabelRef.current);

    window.addEventListener("resize", recalculate);

    return () => {
      if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
      if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
      ro.disconnect();
      window.removeEventListener("resize", recalculate);
    };
  }, [recalculate, containerRef, pillRefs, orgLabelRef, providerLabelRef]);

  return { lines, svgSize, recalculate };
}

type PillProps = {
  layer: Layer;
  isProvider: boolean;
  colIndex: number;
  layerIndex: number;
  pillRef: (el: HTMLDivElement | null) => void;
  onSettled?: () => void;
  isLast?: boolean;
};

function Pill({
  layer,
  isProvider,
  colIndex,
  layerIndex,
  pillRef,
  onSettled,
  isLast,
}: PillProps) {
  return (
    <motion.div
      ref={pillRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onAnimationComplete={() => {
        if (isLast) onSettled?.();
      }}
      transition={{
        duration: 0.6,
        delay: 0.25 + colIndex * 0.08 + layerIndex * 0.05,
        type: "spring",
        stiffness: 100,
      }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-semibold transition-all w-full overflow-hidden ${
        isProvider
          ? "border-white/20 bg-[rgba(21,42,136,0.4)] text-white"
          : "border-white/20 bg-[rgba(149,149,149,0.4)] text-white/60"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isProvider
            ? "bg-[#00a2ff] shadow-[0_0_10px_#00a2ff] animate-pulse"
            : "bg-white/20"
        }`}
      />
      <span className="truncate">{layer.name}</span>
    </motion.div>
  );
}

function ConnectionLines({
  lines,
  svgSize,
  colIndex,
  isLastColumn,
}: {
  lines: LineData[];
  svgSize: { w: number; h: number };
  colIndex?: number;
  isLastColumn?: boolean;
}) {
  if (svgSize.w === 0) return null;

  const providerPillLines = lines.filter(
    (l) => l.merged && l.isProvider && l.index < 1000,
  );
  const providerConnector = lines.find(
    (l) => l.merged && l.isProvider && l.index >= 1000,
  );

  const orgPillLines = lines.filter(
    (l) => l.merged && !l.isProvider && l.index < 1000,
  );
  const orgConnector = lines.find(
    (l) => l.merged && !l.isProvider && l.index >= 1000,
  );

  const lastColSingleOrgCombined =
    isLastColumn &&
    orgPillLines.length === 1 &&
    orgPillLines[0] != null &&
    orgConnector != null;

  const skipLineForLastColOrgCombined = (line: (typeof lines)[number]) => {
    if (!lastColSingleOrgCombined || !orgPillLines[0]) return false;
    if (!line.merged || line.isProvider) return false;
    if (line.index === orgPillLines[0].index) return true;
    if (line.index === 1000) return true;
    return false;
  };

  const lastColOrgCombinedD =
    lastColSingleOrgCombined && orgPillLines[0] && orgConnector
      ? buildLastColumnOrgLabelFirstPath(
          orgConnector.x2,
          orgConnector.y2,
          orgPillLines[0].x1,
          orgPillLines[0].y1,
        )
      : "";

  const CYCLE = 3.0;

  const pillDot = (
    pathD: string,
    fill: string,
    key: string,
    reverse = false,
  ) => (
    <circle key={key} r={2} fill={fill} opacity={0.55}>
      <animateMotion
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        path={pathD}
        keyPoints={reverse ? "1;0;0" : "0;1;1"}
        keyTimes="0;0.5;1"
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values="0.55;0.55;0;0"
        keyTimes="0;0.5;0.5001;1"
      />
    </circle>
  );

  const mergeDot = (
    pathD: string,
    fill: string,
    key: string,
    reverse = false,
  ) => (
    <circle key={key} r={2} fill={fill} opacity={0.55}>
      <animateMotion
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        path={pathD}
        keyPoints={reverse ? "1;1;0" : "0;0;1"}
        keyTimes="0;0.5;1"
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values="0;0;0.55;0.55"
        keyTimes="0;0.4999;0.5;1"
      />
    </circle>
  );

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={svgSize.w}
      height={svgSize.h}
      viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <title>Connection lines</title>
      {lines.map((line) => {
        if (skipLineForLastColOrgCombined(line)) {
          return <Fragment key={line.index} />;
        }

        const isMerged = !!line.merged;

        const useGentleOrg =
          isLastColumn && line.index >= 1000 && !line.isProvider;

        const d = isMerged
          ? line.index >= 1000
            ? useGentleOrg
              ? buildGentleMergeToLabelPath(line.x1, line.y1, line.x2, line.y2)
              : buildMergeToLabelPath(line.x1, line.y1, line.x2, line.y2)
            : buildBezierPath(line.x1, line.y1, line.x2, line.y2)
          : buildSoftBezierPath(line.x1, line.y1, line.x2, line.y2);

        const stroke = line.isProvider
          ? isMerged
            ? "rgba(0,162,255,0.7)"
            : "rgba(0,162,255,0.25)"
          : isMerged
            ? "rgba(148,163,184,0.6)"
            : "rgba(148,163,184,0.25)";

        const width = isMerged ? 0.7 : line.isProvider ? 0.45 : 0.3;

        return (
          <path
            key={line.index}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            strokeLinecap="round"
          />
        );
      })}

      {lastColSingleOrgCombined && lastColOrgCombinedD ? (
        <path
          key="last-col-org-combined"
          d={lastColOrgCombinedD}
          fill="none"
          stroke="rgba(148,163,184,0.6)"
          strokeWidth={0.7}
          strokeLinecap="round"
        />
      ) : null}

      {lastColSingleOrgCombined ? (
        pillDot(
          lastColOrgCombinedD,
          "#e5e7eb",
          `org-${colIndex}-combined`,
          true,
        )
      ) : (
        <>
          {orgPillLines.map((pl) =>
            pillDot(
              buildBezierPath(pl.x1, pl.y1, pl.x2, pl.y2),
              "#e5e7eb",
              `org-${colIndex}-p${pl.index}`,
              true,
            ),
          )}
          {orgConnector &&
            mergeDot(
              isLastColumn
                ? buildGentleMergeToLabelPath(
                    orgConnector.x1,
                    orgConnector.y1,
                    orgConnector.x2,
                    orgConnector.y2,
                  )
                : buildMergeToLabelPath(
                    orgConnector.x1,
                    orgConnector.y1,
                    orgConnector.x2,
                    orgConnector.y2,
                  ),
              "#e5e7eb",
              `org-${colIndex}-m`,
              true,
            )}
        </>
      )}

      {providerPillLines.map((pl) =>
        pillDot(
          buildBezierPath(pl.x1, pl.y1, pl.x2, pl.y2),
          "#00a2ff",
          `prov-${colIndex}-p${pl.index}`,
          true,
        ),
      )}
      {providerConnector &&
        mergeDot(
          buildMergeToLabelPath(
            providerConnector.x1,
            providerConnector.y1,
            providerConnector.x2,
            providerConnector.y2,
          ),
          "#00a2ff",
          `prov-${colIndex}-m`,
          true,
        )}
    </svg>
  );
}

export type LayersCardProps = {
  col: SmartHubLayersColumn;
  colIndex: number;
  columnTitle: string;
  isLastColumn?: boolean;
};

export function LayersCard({
  col,
  colIndex,
  columnTitle,
  isLastColumn,
}: LayersCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>(
    Array(LAYERS.length).fill(null),
  );
  const orgLabelRef = useRef<HTMLSpanElement | null>(null);
  const providerLabelRef = useRef<HTMLSpanElement | null>(null);

  const { lines, svgSize, recalculate } = useLineCalculation(
    col,
    containerRef as RefObject<HTMLDivElement>,
    pillRefs,
    orgLabelRef as RefObject<HTMLSpanElement>,
    providerLabelRef as RefObject<HTMLSpanElement>,
    isLastColumn,
  );

  const [showLines, setShowLines] = useState(false);

  const handleSettled = () => {
    if (!showLines) {
      setShowLines(true);
      recalculate();
    }
  };

  return (
    <div className="box-border flex min-w-0 w-full max-w-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="w-full shrink-0 text-left">
        <h2
          style={LAYERS_CARD_TITLE_BAR}
          className="mx-auto flex w-full max-w-full items-center justify-start font-manrope text-lg font-bold uppercase leading-[100%] tracking-normal"
        >
          {columnTitle}
        </h2>
      </header>
      <div ref={containerRef} className="relative min-h-0 w-full">
        <div className="flex items-stretch justify-between gap-3">
          <div className="relative z-10 flex w-44 flex-col justify-center gap-2 pr-3">
            <span
              ref={orgLabelRef}
              className="relative inline-flex w-full items-center justify-start text-left gap-1 rounded-xl border border-white/15 bg-[rgba(149,149,149,0.4)] px-2.5 py-1.5 backdrop-blur-md text-[8px] font-bold uppercase leading-tight tracking-widest text-white/65"
            >
              Байгууллага
              <br />
              өөрөө хариуцна
            </span>
            {col.managedBy.some((m) => m === "provider") && (
              <span
                ref={providerLabelRef}
                className="relative inline-flex w-full items-center justify-start text-left gap-1 rounded-xl border border-white/15 bg-[rgba(21,42,136,0.4)] px-2.5 py-1.5 backdrop-blur-md text-[8px] font-bold uppercase leading-tight tracking-widest text-white"
              >
                Үйлчилгээ
                <br />
                үзүүлэгч хариуцна
              </span>
            )}
          </div>

          <div className="flex w-44 flex-col gap-1.5">
            {LAYERS.map((layer, layerIndex) => (
              <Pill
                key={`${colIndex}-${layer.id}`}
                layer={layer}
                isProvider={col.managedBy[layerIndex] === "provider"}
                colIndex={colIndex}
                layerIndex={layerIndex}
                pillRef={(el) => {
                  pillRefs.current[layerIndex] = el;
                }}
                isLast={layerIndex === LAYERS.length - 1}
                onSettled={handleSettled}
              />
            ))}
          </div>
        </div>

        {showLines && (
          <ConnectionLines
            lines={lines}
            svgSize={svgSize}
            colIndex={colIndex}
            isLastColumn={isLastColumn}
          />
        )}
      </div>
    </div>
  );
}
