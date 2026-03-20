"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, Cloud, CloudCheck } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";

import { LayersCard, type SmartHubLayersColumn } from "./SmartHubLayers";

type FeatureRow = {
  title: string;
  detail: string;
};

type ColumnData = {
  title: string;
  image: string;
  features: FeatureRow[];
};

type SmartHubScreen0Props = {
  onBack?: () => void;
};

function PlayPopupDivider() {
  const uid = useId().replace(/:/g, "");
  const railGrad = `pp-rail-${uid}`;

  return (
    <svg
      className="w-full max-w-[min(124px,42%)] h-3 shrink-0 text-white"
      viewBox="0 0 124 12"
      fill="none"
      aria-hidden
      focusable={false}
    >
      <title>Декоратив зайлруулагч</title>
      <defs>
        <linearGradient
          id={railGrad}
          x1="0"
          y1="6"
          x2="124"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.38" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="0.62" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 2 6 H 122"
        stroke={`url(#${railGrad})`}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.9}
      />
    </svg>
  );
}

type NavButtonsProps = {
  onBack?: () => void;
  onNext?: () => void;
};

const PLAY_POPUP_CARD_STYLE: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.09) 45%, rgba(255, 255, 255, 0.05) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.36)",
  boxShadow: [
    "inset 0 1px 0 rgba(255, 255, 255, 0.38)",
    "inset 0 -1px 0 rgba(0, 0, 0, 0.08)",
    "0 18px 44px rgba(0, 8, 32, 0.22)",
  ].join(", "),
  backdropFilter: "blur(16px) saturate(1.05)",
  WebkitBackdropFilter: "blur(16px) saturate(1.05)",
};

const PLAY_POPUP_BUTTON_STYLE: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(120, 185, 255, 0.14) 52%, rgba(70, 150, 255, 0.1) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  boxShadow: [
    "inset 0 1px 0 rgba(255, 255, 255, 0.45)",
    "inset 0 -1px 0 rgba(0, 40, 100, 0.1)",
    "0 10px 26px rgba(4, 20, 60, 0.18)",
  ].join(", "),
  backdropFilter: "blur(8px) saturate(1.04)",
  WebkitBackdropFilter: "blur(8px) saturate(1.04)",
};

const PLAY_POPUP_OVERLAY_STYLE: CSSProperties = {
  background: "rgba(4, 12, 40, 0.2)",
  backdropFilter: "blur(4px) saturate(1.04)",
  WebkitBackdropFilter: "blur(4px) saturate(1.04)",
};

const VIDEO_BG_OVERLAY_STYLE: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(15, 39, 142, 0.6) -61.04%, rgba(12, 31, 113, 0.6) -54.17%, #040B28 100%)",
};

const LAYERS_COMPARISON_COLUMNS: SmartHubLayersColumn[] = [
  { managedBy: ["org", "org", "org", "org", "org"] },
  { managedBy: ["org", "provider", "provider", "provider", "provider"] },
];

const COLUMNS: ColumnData[] = [
  {
    title: "Оффистоо сервер байршуулах",
    image: "/on-premises.jpg",
    features: [
      {
        title: "Найдваргүй",
        detail: "сүлжээ, цахилгаан, хөргөлт, аюулгүй байдал",
      },
      {
        title: "Стандарт бус",
        detail: "ISO, PCI, ITIL",
      },
      {
        title: "Зардал өндөр",
        detail: "орчин, тоног төхөөрөмжийн хөрөнгө оруулалт, хүний нөөц",
      },
      {
        title: "Төвөгтэй менежмент",
        detail: "вендор, ашиглалт, засвар үйлчилгээ, хяналт",
      },
      {
        title: "Хугацаа зарцуулдаг",
        detail: "хүчин чадал нэмэх, өргөтгөх",
      },
    ],
  },
  {
    title: "Nexmind Cloud Service",
    image: "/cloud-server.jpg",
    features: [
      {
        title: "Найдвартай",
        detail: "дата төв, давхар хамгаалалт",
      },
      {
        title: "Стандарт",
        detail: "ISO, PCI, ITIL",
      },
      {
        title: "Уян хатан",
        detail: "хүчин чадал өргөтгөх, төлбөр",
      },
      {
        title: "Хялбар",
        detail: "удирдах портал болон хэрэглээ",
      },
      {
        title: "Сонголттой",
        detail: "30 гаруй үйлчилгээтэй",
      },
    ],
  },
];

function NavButtons({ onBack, onNext }: NavButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="absolute bottom-4 right-4 z-10 flex items-center justify-end gap-4"
    >
      <div className="flex items-center gap-4">
        <ArrowLeftIcon
          className="cursor-pointer"
          stroke="#1d8bf8"
          onClick={onBack}
        />
        <ArrowRightIcon
          className="cursor-pointer"
          stroke="#1d8bf8"
          onClick={onNext}
        />
      </div>
    </motion.div>
  );
}

const COLUMN_CARD_MAX_WIDTH = 526.9789428710938;

const comparisonCardClass =
  "w-full min-w-0 overflow-hidden rounded-[16px] border border-[#4a8fd4]/35 bg-[rgba(10,22,58,0.78)] shadow-[0_20px_50px_rgba(2,8,28,0.55)] backdrop-blur-md";

const IMAGE_CARD_OUTER: CSSProperties = {
  width: "100%",
  maxWidth: COLUMN_CARD_MAX_WIDTH,
  boxSizing: "border-box",
};

const IMAGE_FRAME: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  height: 232,
  boxSizing: "border-box",
};

const FEATURES_TEXT_CONTAINER: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

const FEATURES_TITLE_BAR: CSSProperties = {
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

const FEATURES_LIST_ROW: CSSProperties = {
  width: "100%",
  maxWidth: 494.97894287109375,
  height: 28.806928634643555,
  boxSizing: "border-box",
};

const FEATURES_CARD_SURFACE: CSSProperties = {
  width: "100%",
  maxWidth: COLUMN_CARD_MAX_WIDTH,
  height: 298.8118591308594,
  borderRadius: 16,
  border: "0.31px solid rgba(255, 255, 255, 0.35)",
  boxSizing: "border-box",
  padding: 16,
  boxShadow: "0px 0px 22px 0px rgba(17, 40, 145, 0.5)",
  background:
    "linear-gradient(180deg, rgba(17, 40, 145, 0.5) 0%, rgba(5, 12, 43, 0.5) 100%)",
};

type ImageCardProps = {
  col: ColumnData;
  colIndex: number;
};

function ImageCard({ col, colIndex }: ImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: colIndex * 0.08, ease: "easeOut" }}
      style={IMAGE_CARD_OUTER}
      className={`${comparisonCardClass} mx-auto`}
    >
      <div
        className="relative w-full min-w-0 shrink-0 overflow-hidden"
        style={IMAGE_FRAME}
      >
        <Image
          src={col.image}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 768px) 45vw, 100vw"
          priority={colIndex === 0}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[rgba(5,12,35,0.5)] via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}

type FeaturesCardProps = {
  col: ColumnData;
  colIndex: number;
};

function FeaturesCard({ col, colIndex }: FeaturesCardProps) {
  const FeatureIcon = colIndex === 0 ? Cloud : CloudCheck;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.06 + colIndex * 0.08,
        ease: "easeOut",
      }}
      style={FEATURES_CARD_SURFACE}
      className="mx-auto flex min-h-0 w-full max-w-full flex-col gap-4 overflow-hidden"
    >
      <header className="w-full shrink-0 text-left">
        <h2
          style={FEATURES_TITLE_BAR}
          className="mx-auto flex w-full max-w-full items-center justify-start font-manrope text-lg font-bold uppercase leading-[100%] tracking-normal"
        >
          {col.title}
        </h2>
      </header>

      <div
        className="mx-auto min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden"
        style={FEATURES_TEXT_CONTAINER}
      >
        <ul className="flex min-h-0 flex-col gap-3">
          {col.features.map((row) => (
            <li
              key={`${col.title}-${row.title}`}
              style={FEATURES_LIST_ROW}
              className="mx-auto flex w-full max-w-full shrink-0 items-center gap-2 overflow-hidden"
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[#2d5cb0]/55 bg-[#0f2868]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                aria-hidden
              >
                <FeatureIcon
                  className="h-[12px] w-[12px] text-white"
                  strokeWidth={colIndex === 0 ? 1.85 : 1.65}
                />
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0 text-left">
                <p className="font-manrope text-xs font-semibold uppercase leading-[100%] tracking-normal text-white line-clamp-1">
                  {row.title}
                </p>
                <p className="font-manrope text-xs font-normal leading-[100%] tracking-normal line-clamp-1 rounded-sm text-white/50 py-px">
                  {row.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

type ComparisonColumnProps = {
  col: ColumnData;
  colIndex: number;
  showLayers: boolean;
  layersCol: SmartHubLayersColumn;
};

function ComparisonColumn({
  col,
  colIndex,
  showLayers,
  layersCol,
}: ComparisonColumnProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4 md:gap-5">
      <ImageCard col={col} colIndex={colIndex} />
      <AnimatePresence mode="wait">
        {!showLayers ? (
          <motion.div
            key="features"
            initial={false}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="min-h-0 w-full"
          >
            <FeaturesCard col={col} colIndex={colIndex} />
          </motion.div>
        ) : (
          <motion.div
            key="layers"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.32, ease: "easeOut", delay: 0.06 }}
            style={IMAGE_CARD_OUTER}
            className="min-h-0 mx-auto w-full min-w-0"
          >
            <LayersCard
              col={layersCol}
              colIndex={colIndex}
              columnTitle={col.title}
              isLastColumn={colIndex === LAYERS_COMPARISON_COLUMNS.length - 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SmartHubScreen0({ onBack }: SmartHubScreen0Props) {
  const [showPlayPopup, setShowPlayPopup] = useState(false);
  const [showLayersStep, setShowLayersStep] = useState(false);

  useEffect(() => {
    if (!showPlayPopup) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPlayPopup(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPlayPopup]);

  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = bgVideoRef.current;
    if (!el) return;
    const play = () => {
      const p = el.play();
      if (p !== undefined) void p.catch(() => {});
    };
    play();
    el.addEventListener("loadeddata", play);
    return () => el.removeEventListener("loadeddata", play);
  }, []);

  const handleNextClick = () => {
    if (!showLayersStep) {
      setShowLayersStep(true);
      return;
    }
    setShowPlayPopup(true);
  };

  return (
    <div className="h-full w-full font-sans relative overflow-hidden bg-black">
      <div className="scanline" />
      <video
        ref={bgVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none"
      >
        <source src="/videos/slide-background.mp4" type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 z-1"
        style={VIDEO_BG_OVERLAY_STYLE}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-h-0 grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-8">
          {COLUMNS.map((col, colIndex) => (
            <ComparisonColumn
              key={col.title}
              col={col}
              colIndex={colIndex}
              showLayers={showLayersStep}
              layersCol={
                LAYERS_COMPARISON_COLUMNS[colIndex] ??
                LAYERS_COMPARISON_COLUMNS[0]
              }
            />
          ))}
        </div>
        <NavButtons onBack={onBack} onNext={handleNextClick} />
      </div>

      <AnimatePresence>
        {showPlayPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="play-popup-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              aria-label="Хаах"
              style={PLAY_POPUP_OVERLAY_STYLE}
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlayPopup(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={PLAY_POPUP_CARD_STYLE}
              className="relative z-10 box-border flex w-[min(400px,calc(100vw-2.5rem))] flex-col items-center justify-center overflow-hidden rounded-[28px] px-8 py-9 text-center"
            >
              <div className="relative z-10 flex w-full max-w-full flex-col items-center gap-5">
                <p
                  id="play-popup-title"
                  className="max-w-88 text-center font-manrope text-[18px] font-medium leading-snug tracking-tight text-white"
                >
                  Та ялгааг нь харьцуулан
                  <br />
                  <span className="font-bold">тоглож үзээрэй</span>
                </p>

                <PlayPopupDivider />

                <p className="text-center font-manrope text-[16px] font-normal leading-snug text-white/92">
                  Танд амжилт хүсье
                </p>

                <motion.button
                  type="button"
                  onClick={() => {
                    setShowPlayPopup(false);
                    window.location.href = "http://game-src.vercel.app/";
                  }}
                  style={PLAY_POPUP_BUTTON_STYLE}
                  className="mt-1 box-border inline-flex h-12 min-w-[220px] max-w-full shrink-0 cursor-pointer items-center justify-center gap-3 rounded-full px-7 py-3 transition-[filter,transform] hover:brightness-[1.06] active:scale-[0.99]"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-3.5 w-3.5 text-[#1565d8]"
                      fill="currentColor"
                      aria-hidden
                    >
                      <title>Тоглоо</title>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="font-manrope text-[15px] font-semibold leading-none tracking-tight text-white">
                    Тоглоом эхлүүлэх
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
