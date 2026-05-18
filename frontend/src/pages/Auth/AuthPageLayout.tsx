import type { FC, ReactNode } from "react";
import YuiBloomsLogo from "../../assets/img/YuiBloomsLogo.png";
import FacebookLink from "../../components/Brand/FacebookLink";

interface AuthPageLayoutProps {
  children: ReactNode;
}

const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <img
              className="mx-auto h-24 w-auto object-contain lg:mx-0"
              src={YuiBloomsLogo}
              alt="Yui Blooms Flower Bar"
            />
            <p className="yb-eyebrow mt-4">Flower Bar</p>
            <h1 className="yb-page-title mt-2 text-3xl">Admin</h1>
            <p className="yb-page-subtitle">Inventory &amp; orders for the pop-up shop</p>
          </div>
          <div className="yb-auth-frame">{children}</div>
          <p className="mt-6 text-center lg:text-left">
            <FacebookLink />
          </p>
        </div>
      </div>
      <div className="yb-auth-hero hidden lg:flex flex-col gap-8">
        <img
          className="relative z-10 max-h-[min(60vh,520px)] w-auto max-w-[85%] object-contain"
          src={YuiBloomsLogo}
          alt="Yui Blooms branding"
        />
        <FacebookLink className="relative z-10" />
      </div>
    </div>
  );
};

export default AuthPageLayout;
