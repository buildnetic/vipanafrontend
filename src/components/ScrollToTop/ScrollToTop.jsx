import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  const goToTop = () => {
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    goToTop();
  }, [pathname]);

  return (
    <>
      <div
        onClick={goToTop}
        className="fixed right-8 bottom-8 bg-c-green w-12 h-12 flex flex-row justify-center items-center rounded-full shadow-xl cursor-pointer"
      >
        <MdKeyboardDoubleArrowUp className="text-3xl text-white" />
      </div>
    </>
  );
};

export default ScrollToTop;
