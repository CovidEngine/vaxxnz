import { Button, KIND } from "baseui/button";
import { parse } from "date-fns";
import i18next from "i18next";
import { FunctionComponent } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CrowdsourcedLocation } from "../../crowdsourced/CrowdsourcedData";
import { NoticeList } from "../../NoticeList";
import { PageLink } from "../../PageLink";
import { Instruction } from "../../today-locations/healthpoint/HealthpointData";
import { enqueueAnalyticsEvent } from "../../utils/analytics";
import { ModalGrid } from "../../VaxComponents";
import { BookingLocationSlotsPair } from "../booking/BookingDataTypes";
import BookingLocation from "../BookingLocation";
import { CalendarDate } from "../CalendarData";
import { CrowdsourcedBookingLocation } from "./CrowdsourcedBookingLocation";

interface CalendarModalContentProps {
  activeDate: CalendarDate;
}

export const CalendarModalContent: FunctionComponent<CalendarModalContentProps> =
  ({ activeDate: { dateStr, locations } }) => {
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    const { t } = useTranslation("common");

    const sortedLocations = locations;

    const slotLocations = sortedLocations.filter(
      (location) =>
        "isBooking" in location && location.slots && location.slots.length > 0
    ) as BookingLocationSlotsPair[];
    const crowdsourcedBookingLocations = sortedLocations.filter(
      (location) =>
        "isCrowdSourced" in location &&
        location.instructions.includes(Instruction.allowsBookings)
    ) as CrowdsourcedLocation[];
    /* const walkinBookingLocations = sortedLocations.filter(
      (location) =>
        "isCrowdSourced" in location &&
        (location.instructions.includes(Instruction.driveThrough) ||
          location.instructions.includes(Instruction.walkIn))
    ) as CrowdsourcedLocation[]; */

    return (
      <ModalGrid className={"modal-container"}>
        <div>
          <div className="ModalHeader">
            <h1>
              {date.toLocaleDateString([i18next.language], {
                weekday: "long",
              })}
              <br />
              {date.toLocaleDateString([i18next.language], {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </h1>
            <div>
              {" "}
              <br />
              <h3>{t("calendar.modal.howToBook.title")}</h3>
            </div>
            <ol className="HelpList">
              <li>{t("calendar.modal.howToBook.stepOne")}</li>
              <li>
                <Trans
                  i18nKey="calendar.modal.howToBook.stepTwo"
                  t={t}
                  components={[
                    <a
                      href="https://bookmyvaccine.nz"
                      target="_blank"
                      rel="noreferrer"
                    >
                      https://bookmyvaccine.nz
                    </a>,
                  ]}
                />
              </li>
              <li>{t("calendar.modal.howToBook.stepThree")}</li>
            </ol>

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

            <NoticeList />
          </div>
        </div>

        <div style={{ height: "100%" }}>
          <h2>
            {t("calendar.modal.availableSlots")} -{" "}
            {date.toLocaleDateString([i18next.language], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <hr />

          {slotLocations.map((location) => (
            <BookingLocation
              key={location.location.extId}
              locationSlotsPair={location}
              activeDate={{ dateStr, locations }}
            />
          ))}

          {crowdsourcedBookingLocations.map((location) => (
            <CrowdsourcedBookingLocation
              key={location.name}
              location={location}
              date={date}
            />
          ))}

          {slotLocations.length === 0 &&
            crowdsourcedBookingLocations.length === 0 && (
              <>
                <h1>{t("calendar.modal.noBookingsAvailable")}</h1>
              </>
            )}
        </div>
      </ModalGrid>
    );
  };
