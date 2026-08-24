import { ReactNode } from "react";
import ThemeToggle from "@/components/utility/ThemeToggle";
import { useParams, useNavigate, useLocation } from "@tanstack/react-router";
import Logo from "@/components/svg/Logo";
import { useTheme } from "@/hooks/useTheme";
import { deleteCookie } from "@/lib/cookies";

export default function Header(): ReactNode {
  const { leagueId } = useParams({ strict: false }) as { leagueId?: string };
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  //make the mob background transparent if the path is not /scoring as we have a header component that handles it for us
  const backgroundTransparent = !location.pathname.startsWith("/scoring/");
  const handleBackClick = () => {
    if (leagueId) {
      // A team is only ever in one league, so there's no picker to go "back"
      // to — clear the cached selection and return to the start.
      deleteCookie("teamID");
      deleteCookie("leagueID");
      navigate({ to: "/" });
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  };
  return (
    <header className={"md:sticky top-0 z-[1000]"}>
      <div className="w-full h-20 px-10 py-6 justify-between items-center hidden md:flex">
        <div className="w-[104px] h-[25.36px] relative md:z-10">
          {" "}
          <div
            onClick={handleBackClick}
            role="button"
            tabIndex={0}
            aria-label="Back"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") handleBackClick();
            }}
          >
            <Logo mode={theme} />
          </div>
        </div>
        <div className="justify-start items-center gap-2 flex md:z-10">
          <ThemeToggle />
        </div>
      </div>
      <div
        className={`md:hidden ${
          backgroundTransparent
            ? "bg-transparent"
            : "bg-black/5 dark:bg-black/20"
        }`}
      >
        <div className="w-full h-20 p-6 relative flex items-center justify-end">
          <div
            className="absolute left-1/2 -translate-x-1/2"
            onClick={handleBackClick}
            role="button"
            tabIndex={0}
            aria-label="Back"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") handleBackClick();
            }}
          >
            <Logo mode={theme} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
