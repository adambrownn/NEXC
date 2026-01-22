import { Icon } from "@iconify/react";
import fileFill from "@iconify/icons-eva/file-fill";
import roundGrain from "@iconify/icons-ic/round-grain";
import bookOpenFill from "@iconify/icons-eva/book-open-fill";
// routes
import { PATH_PAGE, CATEGORY_PATH } from "../../routes/paths";

// ----------------------------------------------------------------------

const ICON_SIZE = {
  width: 22,
  height: 22,
};

const navConfig = [
  { title: "Home", path: "/" },
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
          { title: "CPCS Cards", path: CATEGORY_PATH.cards.cpcs },
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
          { title: "CITB", path: CATEGORY_PATH.courses.citb },
          { title: "Health and Safety", path: CATEGORY_PATH.courses.healthandsafety },
          { title: "Scaffolding", path: CATEGORY_PATH.courses.scaffolding },
          {
            title: "Plant Operations",
            path: CATEGORY_PATH.courses.plantoperations,
          },
        ],
      },
    ],
  },
  {
    title: "Qualifications",
    icon: <Icon icon={bookOpenFill} {...ICON_SIZE} />,
    path: PATH_PAGE.qualifications,
  },
  { title: "Group Booking", path: "/groupbooking" }
];

export default navConfig;
