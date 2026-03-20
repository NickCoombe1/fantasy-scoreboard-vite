import { ReactNode } from "react";
import ThemeToggle from "@/components/utility/ThemeToggle";
import { Link, useParams, useNavigate, useLocation } from "@tanstack/react-router";
import StyledButton from "@/components/common/StyledButton";
import About from "@/components/svg/About";
import Menu from "@/components/svg/Menu";
import Logo from "@/components/svg/Logo";
import { useTheme } from "@/hooks/useTheme";

export default function Header(): ReactNode {
  const { teamId } = useParams({ strict: false }) as { teamId?: string };
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  //make the mob background transparent if the path is not /scoring as we have a header component that handles it for us
  const backgroundTransparent = !location.pathname.startsWith("/scoring/");
  const handleBackClick = () => {
    if (teamId) navigate({ to: "/team/$teamId", params: { teamId } });
    else {
      window.history.back();
    }
  };
  return (
    <header className={"md:sticky top-0 z-[1000]"}>
      <div className="w-full h-20 px-10 py-6 justify-between items-center hidden md:flex">
        <div className="w-[104px] h-[25.36px] relative md:z-10">
          {" "}
          <div onClick={handleBackClick}>
            <Logo mode={theme} />
          </div>
        </div>
        <div className="justify-start items-center gap-2 flex md:z-10">
          {teamId && (
            <Link to="/team/$teamId" params={{ teamId: teamId! }}>
              <StyledButton label="MY LEAGUES" secondary={true} type="button">
                My Leagues
              </StyledButton>
            </Link>
          )}
          <Link to="/about">
            <StyledButton label="ABOUT" secondary={true} type={"button"}>
              About
            </StyledButton>
          </Link>
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
        <div className="w-full h-20 p-6 justify-between items-center inline-flex align-middle">
          <ThemeToggle />
          <div onClick={handleBackClick}>
            <Logo mode={theme} />
          </div>
          <div className="justify-start items-center gap-1 flex">
            <div className="w-[35px] h-[35px] px-3.5 py-3 bg-button-light-bg-20  bg-button-light-secondary dark:bg-button-dark-bg bg-blend-overlay  rounded justify-center items-center gap-2.5 flex">
              <div className="w-5 h-5 relative">
                <Link to="/about">
                  <About mode={theme} />
                </Link>
              </div>
            </div>
            <div className="w-[35px] h-[35px] px-3.5 py-3 bg-button-light-bg-20  bg-button-light-secondary dark:bg-button-dark-bg bg-blend-overlay  rounded flex-col justify-center items-center gap-[5px] inline-flex">
              {" "}
              {teamId && (
                <Link to="/team/$teamId" params={{ teamId: teamId! }}>
                  <div className="w-5 h-5 relative flex justify-center items-center">
                    <Menu mode={theme} />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
