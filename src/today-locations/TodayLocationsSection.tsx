import { WalkContainer as OtherContainer, WalkMessage } from "../VaxComponents";
import { getDistanceKm } from "../utils/distance";
import { Instruction } from "./healthpoint/HealthpointData";
import { useState } from "react";
import CustomSpinner from "../utils/customSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faWalking } from "@fortawesome/free-solid-svg-icons";
import { enqueueAnalyticsEvent } from "../utils/analytics";
import { Trans, useTranslation } from "react-i18next";
import { useTodayLocationsData } from "./TodayLocationsData";
import { simpleHash } from "../utils/simpleHash";
import { slug } from "../utils/slug";
import { useRadiusKm } from "../utils/useRadiusKm";
import { useCoords } from "../utils/useCoords";
import { PageLink } from "../PageLink";
import { formatDistanceKm } from "../utils/locale";
import { styled } from "styletron-react";
import { Footer } from "../Footer";

const LoadingText = styled("div", {
  marginLeft: "1rem",
  fontSize: "1.5rem",
});

export function TodayLocationsSection() {
  const radiusKm = useRadiusKm();
  const coords = useCoords();
  const locations = useTodayLocationsData();
  const { t, i18n } = useTranslation("common");

  const [currentView, setCurrentView] = useState(30);

  const modalPath = (locationIndex: number) => {
    const location =
      "ok" in locations && locationIndex !== undefined
        ? locations.ok[locationIndex]
        : undefined;
    if (!location) {
      return "";
    }
    return `/locations/${slug(location.name)}-${simpleHash(
      `${location.lat}${location.lng}`
    )}`;
  };

  const openModal = (locationIndex: number) => {
    const location =
      "ok" in locations && locationIndex !== undefined
        ? locations.ok[locationIndex]
        : undefined;

    enqueueAnalyticsEvent("Healthpoint location selected", {
      locationName: location ? location.name : "",
      radiusKm,
    });
  };

  const loadMore = () => {
    setCurrentView((latest) => latest + 12);
  };

  const isOpenNow = (openTimes: string | undefined): boolean => {
    // Parse the time into a usable Date
    const parseTime = (time: string): Date | undefined => {
      let date = new Date();
      let splits = time.split(/[: ]/);
      if (splits.length !== 3) {
        return undefined;
      }
      let isPM = splits[2] === "PM";

      // the hours
      let hours24h: number;

      // the raw hours inform the hours, checking for edge cases.
      let hours12h = parseInt(splits[0]);
      if (isNaN(hours12h)) {
        return undefined;
      }
      // if it's 12:00 AM then it's 00:00
      if (hours12h === 12 && !isPM) {
        hours24h = 0;
      } else if (isPM) {
        // otherwise if PM then add 12 hours
        hours24h = hours12h + 12;
      } else {
        hours24h = hours12h;
      }

      // the minutes
      let minutes = parseInt(splits[1]);
      if (isNaN(minutes)) {
        return undefined;
      }
      date.setHours(hours24h, minutes, 0);
      return date;
    };

    const dateRegex = new RegExp(
      /^[0-9]{1,2}:[0-9]{1,2} [AP]M to [0-9]{1,2}:[0-9]{1,2} [AP]M\.?$/
    );
    if (!openTimes || !dateRegex.test(openTimes.trim())) {
      return true;
    }
    const times = openTimes.trim().split("to");

    // from time
    const fromStr = times[0].trim();

    // to time
    let toStr = times[1].trim();
    // clean up the period.
    if (toStr.charAt(toStr.length - 1) === ".") {
      toStr = toStr.substr(0, toStr.length - 1);
    }

    const timeFrom = parseTime(fromStr);
    const timeTo = parseTime(toStr);
    if (timeFrom === undefined || timeTo === undefined) {
      return true;
    }

    // Deal with the edge case where the closing time "12:00 AM" is parsed as 12AM this morning.
    const midnightThisMorning = new Date();
    midnightThisMorning.setHours(0, 0, 0);
    if (timeTo.getTime() === midnightThisMorning.getTime()) {
      timeTo.setDate(new Date().getDate() + 1);
    }

    const now = new Date();

    return now >= timeFrom && now <= timeTo;
  };

  return (
    <>
      {"ok" in locations ? (
        <div className="WalkSection2">
          <h2>
            <Trans
              i18nKey="walkins.sectionHeader"
              t={t}
              components={[<strong />]}
            />
          </h2>
          <p>
            <Trans
              i18nKey="walkins.subHeader"
              t={t}
              components={[
                <a
                  href="https://covid19.govt.nz/covid-19-vaccines/how-to-get-a-covid-19-vaccination/walk-in-and-drive-through-vaccination-centres/"
                  target="_blank"
                  rel="noreferrer"
                >
                  covid19.govt.nz
                </a>,
              ]}
            />
          </p>
        </div>
      ) : null}
      {"loading" in locations ? (
        <WalkMessage>
          <CustomSpinner />
          <LoadingText>{t("core.loading")}</LoadingText>
        </WalkMessage>
      ) : "error" in locations ? (
        <WalkMessage>Loading failed: {locations.error.message}</WalkMessage>
      ) : locations.ok.length === 0 ? (
        <WalkMessage>{t("walkins.noWalkinDriveThruFound")}</WalkMessage>
      ) : (
        <>
          <OtherContainer>
            {locations.ok
              .filter(({ ...location }) => {
                let openHours;
                if ("isHealthpoint" in location) {
                  openHours = location.openTodayHours;
                } else {
                  const currentDay = new Date().getDay();
                  const hours = location.openingHours.find(
                    (oh) => oh.day === currentDay
                  )!;
                  if (hours.isOpen) {
                    openHours = hours.hours;
                  }
                }
                return isOpenNow(openHours);
              })
              .slice(0, currentView)
              .map(
                (
                  { name, lat: locationLat, lng: locationLng, ...location },
                  index
                ) => {
                  let openHours;
                  let isOpenToday;
                  let instructions;
                  if ("isHealthpoint" in location) {
                    openHours = location.openTodayHours;
                    isOpenToday = location.isOpenToday;
                    instructions = location.instructionLis;
                  } else {
                    instructions = location.instructions;
                    const currentDay = new Date().getDay();
                    const hours = location.openingHours.find(
                      (oh) => oh.day === currentDay
                    )!;
                    isOpenToday = hours.isOpen;
                    if (hours.isOpen) {
                      openHours = hours.hours;
                    }
                  }
                  return (
                    <PageLink
                      to={modalPath(
                        locations.ok.findIndex(
                          (location) => location.name === name
                        )
                      )}
                    >
                      <button
                        className="WalkBox"
                        onClick={() => openModal(index)}
                        key={index}
                      >
                        <section className="WalkItem">
                          <div>
                            <h3>{name}</h3>

                            {locationLat && locationLng && (
                              <p>
                                {t("core.distanceAway", {
                                  distance: formatDistanceKm(
                                    getDistanceKm(coords, {
                                      lat: locationLat,
                                      lng: locationLng,
                                    }),
                                    i18n.language
                                  ),
                                })}{" "}
                                {instructions.includes(Instruction.walkIn) && (
                                  <FontAwesomeIcon icon={faWalking} />
                                )}
                                {instructions.includes(
                                  Instruction.driveThrough
                                ) && <FontAwesomeIcon icon={faCar} />}
                              </p>
                            )}
                          </div>

                          {isOpenToday && (
                            <p>
                              {t("walkins.openString", {
                                openTimeString: openHours,
                              })}
                            </p>
                          )}
                        </section>
                        <img
                          className="Chevron"
                          src="/arrow-right-1.svg"
                          alt=""
                        />
                      </button>
                    </PageLink>
                  );
                }
              )}
          </OtherContainer>

          {"ok" in locations && locations.ok.length / currentView > 1 && (
            <button className="WalkSeeMore" onClick={loadMore}>
              {t("walkins.seeMore")}
            </button>
          )}
        </>
      )}
      {"ok" in locations ? <Footer /> : null}
    </>
  );
}
