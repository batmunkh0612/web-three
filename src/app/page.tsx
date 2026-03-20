"use client";

import { useEffect, useRef, useState } from "react";

import IconPressLink from "../components/IconPressLink";
import SmartHubScreen0 from "../components/SmartHubScreen0";

type ViewName = "home" | "screen0" | "screen1";

const TRANSITION_MS = 260;

const Home = () => {
  const [stack, setStack] = useState<ViewName[]>(["home"]);
  const [activeView, setActiveView] = useState<ViewName>("home");
  const [isVisible, setIsVisible] = useState(true);
  const isTransitioningRef = useRef(false);
  const nextViewRef = useRef<ViewName | null>(null);

  const startTransitionTo = (next: ViewName) => {
    if (next === activeView) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    nextViewRef.current = next;

    setIsVisible(false);

    window.setTimeout(() => {
      const viewToShow = nextViewRef.current;
      if (viewToShow) setActiveView(viewToShow);
      requestAnimationFrame(() => setIsVisible(true));
      window.setTimeout(() => {
        isTransitioningRef.current = false;
        nextViewRef.current = null;
      }, TRANSITION_MS);
    }, TRANSITION_MS);
  };

  const navigateTo = (next: ViewName) => {
    setStack((prev) => [...prev, next]);
    startTransitionTo(next);
  };

  const goBack = () => {
    setStack((prev) => {
      if (prev.length <= 1) return prev;
      const nextStack = prev.slice(0, -1);
      const nextView = nextStack[nextStack.length - 1] ?? "home";
      startTransitionTo(nextView);
      return nextStack;
    });
  };

  useEffect(() => {
    const top = stack[stack.length - 1] ?? "home";
    if (top !== activeView && !isTransitioningRef.current) {
      setActiveView(top);
    }
  }, [stack, activeView]);

  const renderView = () => {
    switch (activeView) {
      case "home":
        return (
          <div className="flex flex-col h-full w-full items-center justify-center gap-20">
            <h1
              className="absolute top-35 font-manrope uppercase text-5xl leading-[100%] tracking-normal text-center"
              style={{ fontFamily: "Manrope, sans-serif", fontWeight: 900 }}
            >
              Nexmind cloud service
            </h1>

            <IconPressLink
              onActivate={() => navigateTo("screen0")}
              className="text-6xl flex flex-col items-center"
              iconSrc="/cloud.png"
              iconAlt="Cloud"
              label="Танилцуулга"
            />
          </div>
        );
      case "screen0":
        return <SmartHubScreen0 onBack={goBack} />;
      default:
        return null;
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {activeView === "home" && (
        <>
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}

      <div className="relative z-10 h-full w-full">
        <div
          className={`absolute inset-0 transition-[opacity,transform] duration-[${TRANSITION_MS}ms] ease-out ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]"
          }`}
        >
          {renderView()}
        </div>
      </div>
    </main>
  );
};

export default Home;
