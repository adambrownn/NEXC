// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Divider } from "@material-ui/core";
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

export default function Policies() {
  return (
    <RootStyle title="Policies | CSL">
      <h1 style={{ textAlign: "center", fontSize: 40 }}>Our Policies</h1>
      <Divider />
      <p id="refund">
        <div style={{ marginBlock: 100 }}>
          <h1>Refund Policy:</h1>
          <br></br>
          <p>
            There will be no refunds for the CSCS card and CITB Test fee under
            any circumstances.
          </p>
          <br></br>
          <h2>CSCS Card -</h2>
          <p>
            We never refund the full CSCS card fee because we charge an £18.99
            administrative fee. We charge a £19.99 administrative fee for the
            Skill card which is never refundable. The £36 part-refund is only
            available for the card if it has not already been submitted to the
            relevant body for issuance. If any other circumstances arise, the
            manager's decision on a refund will be at his or her discretion.
          </p>
          <br></br>
          <p>
            We only process your card application on your behalf. We do not
            issue or print any cards. We cannot ensure that you will receive the
            card as this is completely dependent on the sole authority of the
            Construction Skills Certification Scheme to approve or deny a
            customer's application. If your card is not processed no fee will be
            refunded.
          </p>
          <br></br>
          <h2>CITB Test -</h2>
          <p>
            Upon booking your test, you will not be able to cancel it and you
            will be able to request a reschedule 96 hours before the test time.
            You will receive a full refund if we have not booked your test at
            that time you contact us. In the case where Test Booking is done and
            booking confirmation was shared with you, we cannot offer any refund
            and further decisions will be taken by management accordingly. We do
            not offer any refund for CSCS Card application services but in
            exceptional conditions, management may additionally supply a refund
            at its discretion to customers.
          </p>
          <br></br>
          <p>
            The man or woman taking a test ("the Candidate") is liable for
            attending the test center and taking the test. Construction Safety
            Line is not responsible if the Candidate misses the test and does
            not reach on time; if the Candidate forgets to take a legitimate
            proof of his ID to the test if the candidate fails to pass the test;
            if the Candidate took the wrong test; if the Candidate makes some
            other shape of error about the test or any related matters.
          </p>
          <br></br>
          <h2>Courses-</h2>
          <p>
            Bookings are only confirmed upon you receiving a confirmation email.
            Before this, they can be subject to change. Once confirmation is
            sent there will be no refund.
          </p>
          <br></br>
          <h2>NVQ-</h2>
          <p>
            NVQ fees + 25% of admin fees will be deducted from the refund if the
            assessor denies it.
          </p>
          <p>
            It is mandatory to sign a declaration (I agree with the terms and
            conditions).{" "}
          </p>
          <p>
            When the declaration is signed, the remainder of the NVQ fees is
            due.{" "}
          </p>
          <p>There will be no refund if you fail to complete the NVQ.</p>
          <p>
            The registration cost + 25% fee of administration will be deducted
            if a customer agrees to pay the NVQ fees in installments and then
            changes their mind.
          </p>
          <br></br>
          <p>
            Any statutory rights which you may have as a customer are not
            affected by these terms. Following additional rights you have: You
            can reschedule a booked test. If you like to do so, you need to
            contact us by calling us or emailing us below:
          </p>
          <br></br>
          <a href="mailto:support@constructionsafetyline.co.uk">
            support@constructionsafetyline.co.uk
          </a>
        </div>
      </p>
      <p id="cancellation">
        <div style={{ marginBlock: 100 }}>
          <h1>Cancellation policy:</h1>
          <br></br>
          <p>
            Bookings are only confirmed when you receive an email confirmation.
            They may be subject to change prior to this. Once the confirmation
            email was sent we cannot cancel the order.
          </p>
          <br></br>
          <h2>CITB Test -</h2>
          <p>
            Upon booking your test, you will not be able to cancel it and you
            will be able to request a reschedule 96 hours before the test time.
          </p>
          <br></br>
          <h2>CSCS Cards -</h2>
          <p>
            CSCS Card order cancellation is subject to card submission, If the
            card has not already been submitted to the relevant body to be
            issued the manager's decision on a cancellation or refund will be at
            his or her discretion.
          </p>
          <br></br>
          <h2>Course Cancellation -</h2>
          <p>
            If a customer wants to cancel their course they must provide notice
            to the company. If the customer gives notice of cancellation or
            amendments of the Services within the timeframes indicated below,
            the following charges will be payable by the customer to the company
            for that part of the Services to be canceled or amended.
          </p>
          <br></br>
          <p>30 days or more no cancellation fee</p>
          <br></br>
          <p>
            22-29 days or more prior to the start of the Services: 25% of the
            costs due:
          </p>
          <br></br>
          <p>
            15-21 days prior to the start of the Services, 50% of the payments
            are due:
          </p>
          <br></br>
          <p>
            Or 8-14 days before commencement of the Services-75% of the fees
            due:
          </p>
          <br></br>
          <p>
            or 0-7 days before commencement of the Services- 100% of the fees
            due.
          </p>
          <br></br>
          <h2>NVQ Cancellation - </h2>
          <p>
            The registration cost + 25% fee of administration will be deducted
            if a customer agrees to pay the NVQ fees in full or installments and
            then changes their mind.
          </p>
        </div>
      </p>

      <p id="Rescheduling Policy">
        <div style={{ marginBlock: 100 }}>
          <h1>Rescheduling Policy:</h1>
          <br></br>
          <p>
            If you want to postpone the exam/course booked by us, you must
            contact us via email:{" "}
            <a href="mailto:support@constructionsafetyline.co.uk">
              support@constructionsafetyline.co.uk
            </a>{" "}
            or call +44 (0) 330 912 1773, stating your first name, last name,
            and order ID. If you fail to contact us as described above, your fee
            will not be refunded.
          </p>
          <br></br>
          <h2>Retake tests -</h2>
          <p>
            The retake option is permitted only if you take the original test.
          </p>
          <p>
            The retake option is valid only for 60 days after you have taken the
            first test of your original booking.
          </p>
          <p>
            If you pass the original test then, your retake fees would not be
            refunded.
          </p>
          <p>The fee amount is non-transferable for any other test.</p>
          <p>
            You cannot buy the retake alone. If you fail a test and have not
            originally opted for the retake along with your test, you are
            required to pay the normal fee for the test.
          </p>
          <br></br>
          <h2>Courses -</h2>
          <p>
            The joining instructions may take a few days to arrive, but they
            should be with you one week before the course begins. You must bring
            a valid form of identification as well as your NI number to the
            course. Customers who book online have the option of taking the
            course at any time. However, for course evaluation, the customer
            must contact us via our main lines.
          </p>
        </div>
      </p>
    </RootStyle>
  );
}
