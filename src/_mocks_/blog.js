import faker from "faker";
// utils
import { mockImgCover } from "../utils/mockImages";

// ----------------------------------------------------------------------

const POST_TITLES = [
  "Everything You Need to Know About CSCS Cards: A Comprehensive Guide",
  "How CSCS Certification Enhances Safety and Efficiency on Construction Sites",
  "The Role of CITB in Modernizing Construction Training in the UK",
  "A Step-by-Step Guide to Applying for Your CSCS Cards",
  "CITB Training: Why It’s Essential for Construction Industry Success",
  "How Third-Party Services Simplify CSCS and CITB Certification for Contractors and Individuals",
  "The Future of Construction Training",
  "Choosing the Right Service for Your CSCS and CITB Needs",
  "Improving Construction Site Safety with CSCS Cards and CITB Training",
  "The Financial Benefits of Investing in CSCS and CITB Certifications",
  "Debunking Common Myths About CSCS Cards",
  "Recent Changes in CITB Training: What You Need to Know",
  "Recent Changes in CSCS Cards: What You Need to Know",
  "Building a Competent Workforce",
  "A Contractor’s Guide to Maximizing Your Investment in CSCS and CITB",
  "How Third-Party CSCS and CITB Services Can Save You Time and Money",
  "Digital Transformation in Construction: Streamlining CSCS and CITB Processes",
  "Understanding Health, Safety, and Environmental Training",
  "Keeping Your CSCS Certification Up-to-Date: Renewal Tips and Tricks",
  "Leveraging CITB Training to Advance Your Construction Career",
  "Top Trends in Construction Certification",
  "Understanding CSCS alliance or partner schemes",
  "Cost savings and enhanced workforce competency.",
  "Trusted third-party provider for construction certification services",
];

const posts = [...Array(23)].map((_, index) => ({
  id: faker.datatype.uuid(),
  cover: mockImgCover(index + 1),
  title: POST_TITLES[index + 1],
  createdAt: faker.date.past(),
  view: faker.datatype.number(),
  comment: faker.datatype.number(),
  share: faker.datatype.number(),
  favorite: faker.datatype.number(),
  author: {
    name: faker.name.findName(),
    avatarUrl: `/static/mock-images/avatars/avatar_${index + 1}.jpg`,
  },
}));

export default posts;
