import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../../redux/hooks";
import { setMenuActivePage } from "../../../redux/slices/store";
import { MenuActivePages } from "../../../types/store";

interface MenuItemProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  text: string;
  href: string;
  page: MenuActivePages;
  active?: boolean; // необязательный, по умолчанию false
}

const MenuItem: React.FC<MenuItemProps> = ({
  Icon,
  text = "",
  href = "",
  active = false,
  page = "processes",
}) => {
  const dispatch = useAppDispatch();

  return (
    <Link
      to={href}
      className={`
        flex items-center gap-3 p-[16px] rounded-[10px] h-[40px] text-[18px] font-bold 
        transition-all duration-300 text-liquid-white mt-[20px]
        active:scale-95
        ${
          active
            ? "bg-liquid-darkmain text-white hover:text-liquid-white hover:bg-liquid-lighter hover:ring-[1px] hover:ring-liquid-darkmain hover:ring-inset"
            : " hover:bg-liquid-lighter"
        }
      `}
      onClick={() => dispatch(setMenuActivePage(page))}
    >
      <Icon />
      <span>{text}</span>
    </Link>
  );
};

export default MenuItem;
