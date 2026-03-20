import React from "react";
import { Button } from "@headlessui/react";
import LightMode from "@/components/svg/LightMode";
import DarkMode from "@/components/svg/DarkMode";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle(): React.ReactNode {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-[43px] p-1 bg-graphics-light-depth dark:bg-graphics-dark-depth rounded-lg z-40 shadow-custom-light-header backdrop-blur-20 justify-start items-center gap-1 inline-flex">
      <div
        className={`absolute top-1 left-2 w-[35px] h-[35px] ] px-3.5 py-3 z-2 rounded transform transition-transform duration-200 z-[-2] ${
          theme === "light"
            ? "translate-x-[-4px] bg-button-light-bg"
            : "translate-x-full bg-button-dark-bg bg-button-dark-secondary"
        }`}
      />
      <div className="bg-button-light-bg dark:bg-transparent w-[35px] h-[35px] px-3.5 py-3 rounded justify-center items-center gap-2.5 inline-flex ">
        <Button onClick={toggleTheme}>
          <LightMode mode={theme} />
        </Button>
      </div>

      <div className="w-[35px] h-[35px] px-3.5 py-3 dark:bg-button-dark-bg dark:bg-button-dark-secondary rounded justify-center items-center gap-2.5 inline-flex">
        <Button onClick={toggleTheme}>
          <DarkMode mode={theme} />
        </Button>
      </div>
    </div>
  );
}
