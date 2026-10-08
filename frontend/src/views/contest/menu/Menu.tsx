import { Logo } from "../../../assets/logos";
import {
  Openbook,
  Processes,
  Settings,
  Home,
  Clipboard,
  Cup,
} from "../../../assets/icons/menu";
import MenuItem from "./MenuItem";
import { useAppSelector } from "../../../redux/hooks";
import { Contest } from "../../../types/contest";
import { FC } from "react";
import { MenuActivePages } from "../../../types/store";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  text: string;
  href: string;
  Icon: any;
  page: MenuActivePages;
}

interface ManuProps {
  contest: Contest;
}

const Menu: FC<ManuProps> = ({ contest }) => {
  const navigate = useNavigate();
  const menuItems: MenuItem[] = [
    {
      text: "Главная",
      href: "/",
      Icon: Home,
      page: "contests",
    },
    {
      text: "Процессы",
      href: `/contest/${contest.id}/processes`,
      Icon: Processes,
      page: "processes",
    },
    {
      text: "Настройки",
      href: `/contest/${contest.id}/settings`,
      Icon: Settings,
      page: "settings",
    },
    {
      text: "Сравнение",
      href: `/contest/${contest.id}/comparisons`,
      Icon: Openbook,
      page: "comparisons",
    },
    {
      text: "Проверка",
      href: `/contest/${contest.id}/conditions`,
      Icon: Clipboard,
      page: "conditions",
    },
    {
      text: "Результаты",
      href: `/contest/${contest.id}/statistics`,
      Icon: Cup,
      page: "statistics",
    },
  ];
  const activePage = useAppSelector((state) => state.store.menu.activePage);

  return (
    <div className="w-[250px] h-full fixed top-0 items-center box-border p-[20px] pt-[35px]">
      <img
        src={Logo}
        className="w-[173px] cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      />
      <div className="">
        {menuItems.map((v, i) => (
          <MenuItem
            key={i}
            Icon={v.Icon}
            text={v.text}
            href={v.href}
            active={v.page == activePage && activePage != "contests"}
            page={v.page}
          />
        ))}
      </div>
    </div>
  );
};

export default Menu;
