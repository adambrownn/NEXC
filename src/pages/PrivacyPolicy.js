// material
import { experimentalStyled as styled } from "@mui/material/styles";
import { Divider } from "@mui/material";
// components
import Page from "../components/Page";
const RootStyle = styled(Page)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  [theme.breakpoints.up("md")]: {
    paddingTop: theme.spacing(11),
  },
  marginInline: 150,
  "@media (max-width: 1200px)": {
    marginInline: 50,
  },
  "@media (max-width: 600px)": {
    marginInline: 20,
  },
}));

export default function PrivacyPolicy() {
  return (
    <RootStyle title="Privacy Policy">
      <h1 style={{ textAlign: "center", fontSize: 40 }}>Privacy Policy</h1>
      <Divider />
      <div style={{ marginBlock: 100 }}>
        NEXC Privacy statement. Company Number 13546291
        (Registered in England {"&"} Wales).
        <h1>Privacy Policy for NEXC</h1>
        At NEXC, accessible from
        www.nexc.co.uk, one of our main priorities is the
        privacy of our visitors. This Privacy Policy document contains types of
        information that is collected and recorded by NEXC
        and how we use it. If you have additional questions or require more
        information about our Privacy Policy, do not hesitate to contact us.
        This Privacy Policy applies only to our online activities and is valid
        for visitors to our website with regards to the information that they
        shared and/or collect in NEXC. This policy is not
        applicable to any information collected offline or via channels other
        than this website.
        <h2>Consent</h2>
        By using our website, you hereby consent to our Privacy Policy and agree
        to its terms.
        <h2>Information we collect</h2>
        The personal information that you are asked to provide, and the reasons
        why you are asked to provide it, will be made clear to you at the point
        we ask you to provide your personal information. If you contact us
        directly, we may receive additional information about you such as your
        name, email address, phone number, National Insurance Number, the
        contents of the message and/or attachments you may send us, and any
        other information you may choose to provide. When you apply for any
        services/products on our website, we may ask for your contact
        information, including items such as name, company name, address, email
        address, and telephone number.
        <h2>How we use your information</h2>
        We use the information we collect in various ways, including to:
        <ul>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>
            Communicate with you, either directly or through one of our
            partners, including for customer service, to provide you with
            updates and other information relating to the website, and for
            marketing and promotional purposes
          </li>
          <li>Send you emails</li>
          <li>
            Ensure that our Terms and Conditions and other policies are followed
          </li>
          <li>Find and prevent fraud</li>
        </ul>
        <h2>Log Files</h2>
        NEXC follows a standard procedure of using log
        files. These files log visitors when they visit websites. All hosting
        companies do this and are a part of hosting services' analytics. The
        information collected by log files includes internet protocol (IP)
        addresses, browser type, Internet Service Provider (ISP), date and time
        stamp, referring/exit pages, and possibly the number of clicks. These
        are not linked to any information that is personally identifiable. The
        purpose of the information is for analyzing trends, administering the
        site, tracking users' movement on the website, and gathering demographic
        information.
        <h2>Cookies and Web Beacons</h2>
        Like any other website, NEXC uses cookies. These
        cookies are used to store information including visitors' preferences,
        and the pages on the website that the visitor accessed or visited. The
        information is used to optimize the users' experience by customizing our
        web page content based on visitors' browser type and/or other
        information.
        <h2>Third Party Privacy Policies</h2>
        NEXC's Privacy Policy does not apply to other
        advertisers or websites. Thus, we are advising you to consult the
        respective Privacy Policies of these third-party ad servers for more
        detailed information. It may include their practices and instructions
        about how to opt out of certain options. You can choose to disable
        cookies through your individual browser options. To know more detailed
        information about cookie management with specific web browsers, it can
        be found at the browsers' respective websites.
        <h2>Privacy Rights (Do Not Sell My Personal Information)</h2>
        request that a business that collects a consumer's personal data
        disclose the categories and specific pieces of personal data that a
        business has collected about consumers. request that a business delete
        any personal data about the consumer that a business has collected. If
        you make a request, we have one month to respond to you. If you would
        like to exercise any of these rights, please contact us.
        <h2>Data Protection Rights</h2>
        We would like to make sure you are fully aware of all of your data
        protection rights. Every user is entitled to the following: The right to
        access – You have the right to request copies of your personal data. We
        may charge you a small fee for this service. The right to rectification
        – You have the right to request that we correct any information you
        believe is inaccurate. You also have the right to request that we
        complete the information you believe is incomplete. The right to erasure
        – You have the right to request that we erase your personal data, under
        certain conditions. The right to restrict processing – You have the
        right to request that we restrict the processing of your personal data,
        under certain conditions. The right to object to processing – You have
        the right to object to our processing of your personal data, under
        certain conditions. The right to data portability – You have the right
        to request that we transfer the data that we have collected to another
        organization, or directly to you, under certain conditions. If you make
        a request, we have one month to respond to you. If you would like to
        exercise any of these rights, please contact us.
        <h2>Services on a global scale</h2>
        NEXC may store, transfer, and process your
        information with service providers in Europe, India, Asia Pacific, and
        North and South America to facilitate our overseas operations
        <h2>Children's Information</h2>
        Another part of our priority is adding protection for children while
        using the internet. We encourage parents and guardians to observe,
        participate in, and/or monitor and guide their online activity.
        NEXC does not knowingly collect any Personal
        Identifiable Information from children under the age of 16. If you think
        that your child provided this kind of information on our website, we
        strongly encourage you to contact us immediately and we will do our best
        efforts to promptly remove such information from our records. Contact
        Us: Please contact us for any questions or complaints about this Privacy
        Policy or NEXC's information handling practices, you
        may email us or contact us at: NEXC, Barampur, UP, 246731 email:
        support@nexc.co.uk
      </div>
    </RootStyle>
  );
}
