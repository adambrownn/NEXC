import { Icon } from "@iconify/react";
import homeFill from "@iconify/icons-eva/home-fill";
import fileFill from "@iconify/icons-eva/file-fill";
import roundGrain from "@iconify/icons-ic/round-grain";
import bookOpenFill from "@iconify/icons-eva/book-open-fill";
// routes
import { PATH_PAGE, PATH_DASHBOARD, CATEGORY_PATH } from "../../routes/paths";

// ----------------------------------------------------------------------

const ICON_SIZE = {
  width: 22,
  height: 22,
};

const menuConfig = [
  {
    title: "Home",
    icon: <Icon icon={homeFill} {...ICON_SIZE} />,
    path: "/",
  },
  {
    title: "Trades",
    icon: <Icon icon={roundGrain} {...ICON_SIZE} />,
    path: PATH_PAGE.trades,
  },
  {
    title: "Services",
    path: "/services",
    icon: <Icon icon={fileFill} {...ICON_SIZE} />,
    children: [
      {
        subheader: "Cards",
        items: [
          { title: "CSCS Cards", path: CATEGORY_PATH.cards.cscs },
          { title: "Skill Cards", path: CATEGORY_PATH.cards.skill },
          { title: "CISRS Cards", path: CATEGORY_PATH.cards.cisrs },
        ],
      },
      {
        subheader: "Tests",
        items: [
          { title: "Operatives", path: CATEGORY_PATH.tests.operative },
          { title: "Specialist", path: CATEGORY_PATH.tests.specialist },
          { title: "CPCS Renewal", path: CATEGORY_PATH.tests.cpcs },
          {
            title: "Managers and Professional",
            path: CATEGORY_PATH.tests.managers,
          },
        ],
      },
      {
        subheader: "Courses",
        items: [
          { title: "Operative", path: CATEGORY_PATH.courses.operative },
          { title: "Supervision", path: CATEGORY_PATH.courses.supervision },
          { title: "Scaffolding", path: CATEGORY_PATH.courses.scaffolding },
          {
            title: "Managerial and Directoral",
            path: CATEGORY_PATH.courses.managerial,
          },
        ],
      },
      // {
      //   subheader: "Additionals",
      //   items: [
      //     { title: "About Us", path: PATH_PAGE.about },
      //     { title: "Contact Us", path: PATH_PAGE.contact },
      //     { title: "Need support", path: PATH_PAGE.faqs },
      //     { title: "FAQs", path: PATH_PAGE.faqs },
      //   ],
      // },
      {
        subheader: "Group Booking",
        items: [{ title: "Group Booking", path: PATH_DASHBOARD.root }],
      },
    ],
  },
  {
    title: "Qualifications",
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    path: PATH_PAGE.qualifications,
  },
];

export default menuConfig;
