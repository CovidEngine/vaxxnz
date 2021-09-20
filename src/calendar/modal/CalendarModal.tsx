/* eslint-disable react/jsx-no-target-blank */
import { Button, KIND } from "baseui/button";
import { FunctionComponent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { enqueueAnalyticsEvent } from "../../utils/analytics";
import { CalendarModalContent } from "./CalendarModalContent";
import { useParams } from "react-router-dom";
import { BookingData } from "../booking/BookingData";
import { LoadingBookingCalendar } from "../Calendar";
import { PageLink } from "../../PageLink";

interface BookingModalProps {
  bookingData?: BookingData;
}

const BookingModal: FunctionComponent<BookingModalProps> = ({
  bookingData,
}) => {
  const { t } = useTranslation("common");
  const { date } = useParams<{ date: string }>();
  const isMobileView = useMediaQuery({ query: "(max-width: 768px)" });

  // Fixme: this is trash because the data structure is trash
  const unwind = useMemo(
    () =>
      Array.from(bookingData?.values() || [])
        .flatMap((map) => Array.from(map.entries()))
        .find((obj) => {
          if (date === obj[0]) {
            return true;
          }
          return false;
        }),
    [bookingData, date]
  );

  if (!bookingData || !unwind) {
    return <LoadingBookingCalendar />;
  }

  const activeDate = { dateStr: unwind[0], locations: unwind[1] };

  const desktopDialogStyle = {
    width: "100%",
  };
  const mobileDialogStyle = {
    width: "100vw",
    margin: "0rem",
    borderRadius: "0",
  };
  const sharedDialogStyle = {
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    padding: "1.5rem",
    backgroundColor: "white",
    border: "1px solid lightgray",
    maxWidth: "1440px",
    boxSizing: "border-box",
  };
  const dialogStyle = isMobileView
    ? { ...mobileDialogStyle, ...sharedDialogStyle }
    : { ...desktopDialogStyle, ...sharedDialogStyle };

  return (
    <div style={dialogStyle as any}>
      {activeDate && <CalendarModalContent activeDate={activeDate} />}
      <div className="MobileOnly">
        <PageLink to="/">
          <Button
            onClick={() => {
              enqueueAnalyticsEvent("Back to Calendar clicked");
            }}
            overrides={{
              Root: {
                style: {
                  width: "100%",
                  marginTop: "1rem",
                  marginRight: 0,
                  marginBottom: "1rem",
                  marginLeft: 0,
                },
              },
            }}
            kind={KIND.secondary}
          >
            {t("calendar.modal.backToCalendar")}
          </Button>
        </PageLink>
      </div>
    </div>
  );
};
export default BookingModal;
