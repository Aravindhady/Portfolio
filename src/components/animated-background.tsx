"use client";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Application, SPEObject, SplineEvent } from "@splinetool/runtime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import { Skill, SkillNames, SKILLS } from "@/data/constants";
import { sleep } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreloader } from "./preloader";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const STATES = {
  hero: {
    desktop: {
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      position: { x: 400, y: -200, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    mobile: {
      scale: { x: 0.15, y: 0.15, z: 0.15 },
      position: { x: 0, y: -200, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
  },
  about: {
    desktop: {
      scale: { x: 0.4, y: 0.4, z: 0.4 },
      position: { x: 0, y: -40, z: 0 },
      rotation: {
        x: 0,
        y: Math.PI / 12,
        z: 0,
      },
    },
    mobile: {
      scale: { x: 0.2, y: 0.2, z: 0.2 },
      position: { x: 0, y: -40, z: 0 },
      rotation: {
        x: 0,
        y: Math.PI / 6,
        z: 0,
      },
    },
  },
  skills: {
    desktop: {
      scale: { x: 0.4, y: 0.4, z: 0.4 },
      position: { x: 0, y: -40, z: 0 },
      rotation: {
        x: 0,
        y: Math.PI / 12,
        z: 0,
      },
    },
    mobile: {
      scale: { x: 0.2, y: 0.2, z: 0.2 },
      position: { x: 0, y: -40, z: 0 },
      rotation: {
        x: 0,
        y: Math.PI / 6,
        z: 0,
      },
    },
  },
  projects: {
    desktop: {
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      position: { x: 0, y: -40, z: 0 },
      rotation: {
        x: Math.PI,
        y: Math.PI / 3,
        z: Math.PI,
      },
    },
    mobile: {
      scale: { x: 0.18, y: 0.18, z: 0.18 },
      position: { x: 0, y: 150, z: 0 },
      rotation: {
        x: Math.PI,
        y: Math.PI / 3,
        z: Math.PI,
      },
    },
  },
  contact: {
    desktop: {
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      position: { x: 500, y: -250, z: 0 },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    mobile: {
      scale: { x: 0.18, y: 0.18, z: 0.18 },
      position: { x: 0, y: 150, z: 0 },
      rotation: {
        x: Math.PI,
        y: Math.PI / 3,
        z: Math.PI,
      },
    },
  },
};

type Section = "hero" | "about" | "skills" | "projects" | "contact";

const AnimatedBackground = () => {
  const { isLoading, bypassLoading } = usePreloader();
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const splineContainer = useRef<HTMLDivElement>(null);
  const [splineApp, setSplineApp] = useState<Application>();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [bongoAnimation, setBongoAnimation] = useState<{
    start: () => void;
    stop: () => void;
  }>();
  const [keycapAnimtations, setKeycapAnimtations] = useState<{
    start: () => void;
    stop: () => void;
  }>();

  const keyboardStates = useCallback((section: Section) => {
    return STATES[section][isMobile ? "mobile" : "desktop"];
  }, [isMobile]);

  const handleMouseHover = useCallback((e: SplineEvent) => {
    if (!splineApp || selectedSkill?.name === e.target.name) return;

    if (e.target.name === "body" || e.target.name === "platform") {
      setSelectedSkill(null);
      if (splineApp.getVariable("heading") && splineApp.getVariable("desc")) {
        splineApp.setVariable("heading", "");
        splineApp.setVariable("desc", "");
      }
    } else {
      if (!selectedSkill || selectedSkill.name !== e.target.name) {
        const skill = SKILLS[e.target.name as SkillNames];
        setSelectedSkill(skill);
      }
    }
  }, [splineApp, selectedSkill]);

  const handleSplineInteractions = useCallback(() => {
    if (!splineApp) return;
    splineApp.addEventListener("mouseHover", handleMouseHover);
    return () => {
      splineApp.removeEventListener("mouseHover", handleMouseHover);
    };
  }, [splineApp, handleMouseHover]);

  const handleGsapAnimations = useCallback(() => {
    if (!splineApp) return;
    const kbd = splineApp.findObjectByName("keyboard");
    if (!kbd) return;
    gsap.to(kbd.scale, {
      x: keyboardStates(activeSection).scale.x,
      y: keyboardStates(activeSection).scale.y,
      z: keyboardStates(activeSection).scale.z,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(kbd.position, {
      x: keyboardStates(activeSection).position.x,
      y: keyboardStates(activeSection).position.y,
      z: keyboardStates(activeSection).position.z,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(kbd.rotation, {
      x: keyboardStates(activeSection).rotation.x,
      y: keyboardStates(activeSection).rotation.y,
      z: keyboardStates(activeSection).rotation.z,
      duration: 1,
      ease: "power2.inOut",
    });
  }, [splineApp, activeSection, keyboardStates]);

  const getBongoAnimation = useCallback(() => {
    if (!splineApp) return;
    const bongo = splineApp.findObjectByName("bongo");
    if (!bongo) return;

    const start = () => {
      gsap.to(bongo.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
      });
    };

    const stop = () => {
      gsap.to(bongo.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.2,
      });
    };

    return { start, stop };
  }, [splineApp]);

  const getKeycapsAnimation = useCallback(() => {
    if (!splineApp) return;
    const keycaps = splineApp.findObjectByName("keycaps");
    if (!keycaps) return;

    const start = () => {
      gsap.to(keycaps.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
      });
    };

    const stop = () => {
      gsap.to(keycaps.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.2,
      });
    };

    return { start, stop };
  }, [splineApp]);

  // handle keyboard press interaction
  useEffect(() => {
    if (!selectedSkill || !splineApp) return;
    splineApp.setVariable("heading", selectedSkill.label);
    splineApp.setVariable("desc", selectedSkill.shortDescription);
  }, [selectedSkill, splineApp]);

  // handle keyboard heading and desc visibility
  useEffect(() => {
    if (!splineApp) return;
    const textDesktopDark = splineApp.findObjectByName("text-desktop-dark");
    const textDesktopLight = splineApp.findObjectByName("text-desktop");
    const textMobileDark = splineApp.findObjectByName("text-mobile-dark");
    const textMobileLight = splineApp.findObjectByName("text-mobile");
    if (
      !textDesktopDark ||
      !textDesktopLight ||
      !textMobileDark ||
      !textMobileLight
    )
      return;
    if (activeSection !== "skills") {
      textDesktopDark.visible = false;
      textDesktopLight.visible = false;
      textMobileDark.visible = false;
      textMobileLight.visible = false;
      return;
    }
    if (theme === "dark" && !isMobile) {
      textDesktopDark.visible = false;
      textDesktopLight.visible = true;
      textMobileDark.visible = false;
      textMobileLight.visible = false;
    } else if (theme === "dark" && isMobile) {
      textDesktopDark.visible = false;
      textDesktopLight.visible = false;
      textMobileDark.visible = false;
      textMobileLight.visible = true;
    } else if (theme === "light" && !isMobile) {
      textDesktopDark.visible = true;
      textDesktopLight.visible = false;
      textMobileDark.visible = false;
      textMobileLight.visible = false;
    } else {
      textDesktopDark.visible = false;
      textDesktopLight.visible = false;
      textMobileDark.visible = true;
      textMobileLight.visible = false;
    }
  }, [theme, splineApp, isMobile, activeSection]);

  // initialize gsap animations
  useEffect(() => {
    if (!splineApp) return;
    handleSplineInteractions();
    handleGsapAnimations();
    setBongoAnimation(getBongoAnimation());
    setKeycapAnimtations(getKeycapsAnimation());
  }, [splineApp, handleSplineInteractions, handleGsapAnimations, getBongoAnimation, getKeycapsAnimation]);

  useEffect(() => {
    let rotateKeyboard: gsap.core.Tween;
    let teardownKeyboard: gsap.core.Tween;
    (async () => {
      if (!splineApp) return;
      const kbd: SPEObject | undefined = splineApp.findObjectByName("keyboard");
      if (!kbd) return;
      rotateKeyboard = gsap.to(kbd.rotation, {
        y: Math.PI * 2 + kbd.rotation.y,
        duration: 10,
        repeat: -1,
        yoyo: true,
        yoyoEase: true,
        ease: "back.inOut",
        delay: 2.5,
      });
      teardownKeyboard = gsap.fromTo(
        kbd.rotation,
        {
          y: 0,
          x: -Math.PI,
          z: 0,
        },
        {
          y: -Math.PI / 2,
          duration: 5,
          repeat: -1,
          yoyo: true,
          yoyoEase: true,
          delay: 2.5,
          immediateRender: false,
          paused: true,
        }
      );
      if (activeSection === "hero") {
        rotateKeyboard.restart();
        teardownKeyboard.pause();
      } else if (activeSection === "contact") {
        rotateKeyboard.pause();
        teardownKeyboard.restart();
      }
    })();
    return () => {
      rotateKeyboard?.kill();
      teardownKeyboard?.kill();
    };
  }, [splineApp, activeSection]);

  const [keyboardRevealed, setKeyboardRevealed] = useState(false);
  const router = useRouter();
  const revealKeyCaps = useCallback(async () => {
    if (!splineApp) return;
    const kbd = splineApp.findObjectByName("keyboard");
    if (!kbd) return;
    kbd.visible = false;
    await sleep(400);
    kbd.visible = true;
    setKeyboardRevealed(true);
    console.log(activeSection);
    gsap.fromTo(
      kbd?.scale,
      { x: 0.01, y: 0.01, z: 0.01 },
      {
        x: keyboardStates(activeSection).scale.x,
        y: keyboardStates(activeSection).scale.y,
        z: keyboardStates(activeSection).scale.z,
        duration: 1.5,
        ease: "elastic.out(1, 0.6)",
      }
    );

    const allObjects = splineApp.getAllObjects();
    const keycaps = allObjects.filter((obj) => obj.name === "keycap");
    await sleep(900);
    if (isMobile) {
      const mobileKeyCaps = allObjects.filter(
        (obj) => obj.name === "keycap-mobile"
      );
      mobileKeyCaps.forEach((keycap, idx) => {
        keycap.visible = true;
      });
    } else {
      const desktopKeyCaps = allObjects.filter(
        (obj) => obj.name === "keycap-desktop"
      );
      desktopKeyCaps.forEach(async (keycap, idx) => {
        await sleep(idx * 70);
        keycap.visible = true;
      });
    }
    keycaps.forEach(async (keycap, idx) => {
      keycap.visible = false;
      await sleep(idx * 70);
      keycap.visible = true;
      gsap.fromTo(
        keycap.position,
        { y: 200 },
        { y: 50, duration: 0.5, delay: 0.1, ease: "bounce.out" }
      );
    });
  }, [splineApp, activeSection, isMobile, keyboardStates]);

  useEffect(() => {
    const hash = activeSection === "hero" ? "#" : `#${activeSection}`;
    router.push("/" + hash, { scroll: false });
    if (!splineApp || isLoading || keyboardRevealed) return;
    revealKeyCaps();
  }, [splineApp, isLoading, activeSection, keyboardRevealed, revealKeyCaps, router]);

  useEffect(() => {
    if (!keyboardRevealed) {
      revealKeyCaps();
    }
    router.prefetch("/");
  }, [keyboardRevealed, revealKeyCaps, router]);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Spline
          ref={splineContainer}
          onLoad={(app) => {
            setSplineApp(app);
          }}
          scene="/assets/skills-keyboard.spline"
        />
      </Suspense>
    </>
  );
};

export default AnimatedBackground;
