import { faCar, faWalking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, KIND } from "baseui/button";
import { Modal } from "baseui/modal";
import { FunctionComponent } from "react";
import { Trans, useTranslation } from "react-i18next";
import { enqueueAnalyticsEvent } from "../../utils/analytics";
import { WalkGrid } from "../../VaxComponents";
import { useMediaQuery } from "react-responsive";
import { LocationNotice } from "../../common/LocationNotice";
import { HealthpointLocation } from "./HealthpointData";

type Props = {
  clearSelectedLocation: () => void;
  location?: HealthpointLocation;
  radiusKm: number;
};

const HealthpointModal: FunctionComponent<Props> = ({
  clearSelectedLocation,
  location,
  radiusKm,
}) => {
  const close = () => clearSelectedLocation();
  const { t } = useTranslation("common");
  const isMobileView = useMediaQuery({ query: "(max-width: 768px)" });
  if (location == null) {
    return null;
  }
  const telephone = location.telephone.replace(/\[.*\]/g, "");

  const desktopDialogStyle = {
    width: "80vw",
  };
  const mobileDialogStyle = {
    width: "100vw",
    margin: "0rem",
    borderRadius: "0",
  };
  const sharedDialogStyle = {
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    padding: "1.5rem",
  };
  const dialogStyle = isMobileView
    ? { ...mobileDialogStyle, ...sharedDialogStyle }
    : { ...desktopDialogStyle, ...sharedDialogStyle };
  return (
    <Modal
      onClose={close}
      isOpen={!!location}
      unstable_ModalBackdropScroll={true}
      size="full"
      overrides={{
        Root: { style: { zIndex: 1500 } },
        Dialog: {
          style: dialogStyle as any,
        },
      }}
    >
      <WalkGrid className={"modal-container WalkModal"}>
        <div>
          <h1
            style={{
              marginBottom: "0.5rem",
            }}
          >
            {location.name}
          </h1>
          <LocationNotice instructions={location.instructionLis} />
          <hr />

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              overrides={{
                Root: {
                  style: {
                    width: "100%",
                    marginTop: "1.5rem",
                    marginRight: 0,
                    marginBottom: "0.5rem",
                    marginLeft: 0,
                  },
                },
              }}
              kind={KIND.primary}
              onClick={() =>
                enqueueAnalyticsEvent("Healthpoint Get Directions clicked", {
                  locationName: location.name,
                  radiusKm,
                })
              }
            >
              {t("core.getDirections")}
            </Button>
          </a>
          <Button
            overrides={{
              Root: {
                style: {
                  width: "100%",
                  marginTop: "0.5rem",
                  marginRight: 0,
                  marginBottom: "0.5rem",
                  marginLeft: 0,
                },
              },
            }}
            kind={KIND.secondary}
            onClick={close}
          >
            {t("walkins.cancelBooking")}
          </Button>
        </div>
        <div style={{ height: "100%" }}>
          <section>
            <h3>Address</h3>
            <p>{location.address}</p>
          </section>

          {location.url && (
            <section>
              <h3>{t("core.website")}</h3>
              <a href={location.url} target="_blank" rel="noreferrer">
                {location.url}
              </a>
            </section>
          )}

          {telephone && (
            <section>
              <h3>{t("walkins.phone")}</h3>
              <a href={`tel:${telephone}`}>{telephone}</a>
            </section>
          )}

          {location.opennningHours.schedule && (
            <section>
              <h3>{t("walkins.hours")}</h3>
              {Object.keys(location.opennningHours.schedule).map(
                (openDate, index) => {
                  return (
                    <p key={index}>
                      {openDate} {location.opennningHours.schedule[openDate]}
                      <br />
                    </p>
                  );
                }
              )}
            </section>
          )}

          {Object.entries(location.opennningHours.exceptions).map(
            ([key, value], index) => {
              return (
                <section
                  key={index}
                  style={{
                    marginTop: "1rem",
                    lineHeight: "1.5",
                  }}
                >
                  <h3>
                    {key === "Public Holidays"
                      ? t("walkins.publicHolidays")
                      : t("walkins.otherExeptions")}
                  </h3>

                  <p key={index}>{value}</p>
                </section>
              );
            }
          )}
          {location.opennningHours.notesHtml.map((noteHtml, index) => {
            return (
              <div key={index} style={{ marginTop: "1rem" }}>
                <small
                  key={index}
                  dangerouslySetInnerHTML={{ __html: noteHtml }}
                ></small>
              </div>
            );
          })}
        </div>
      </WalkGrid>
      <div className="MobileOnly">
        <Button
          onClick={close}
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
          {t("walkins.cancelBooking")}
        </Button>
      </div>
    </Modal>
  );
};

export default HealthpointModal;
