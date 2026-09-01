import { Outlet } from "react-router-dom";

import ThemeToggle from "@/components/theme-toggle";

const BaseLayout = () => {
  return (
    <div className="relative flex flex-col w-full h-auto">
      {/* the sign-in, sign-up and invite pages have no app header, so the
          toggle lives here — otherwise a visitor could not change the theme
          until after logging in */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full mx-auto h-auto ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
