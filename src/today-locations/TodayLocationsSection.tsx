import {
  WalkBox as OtherBox,
  WalkContainer as OtherContainer,
} from "../VaxComponents";
import WalkModal from "./healthpoint/HealthpointModal";
import { getDistanceKm } from "../utils/distance";
import { Coords } from "../location-picker/LocationPicker";
import {
  Instruction,
  HealthpointLocation,
} from "./healthpoint/HealthpointData";
import { useState } from "react";
import { Spinner } from "baseui/spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faWalking } from "@fortawesome/free-solid-svg-icons";
import { enqueueAnalyticsEvent } from "../utils/analytics";
import { Trans, useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { useTodayLocationsData } from "./TodayLocationsData";
import { CrowdsourcedLocation } from "../crowdsourced/CrowdsourcedData";
import CrowdsourcedModal from "../crowdsourced/CrowdsourcedModal";

export interface Props {
  coords: Coords;
  radiusKm: number;
}

export function TodayLocationsSection({ coords, radiusKm }: Props) {
  const isMobileView = useMediaQuery({ query: "(max-width: 768px)" });
  const locations = useTodayLocationsData(coords, radiusKm);
  const { t } = useTranslation("common");

  const [selectedLocationIndex, setSelectedLocation] = useState<number>();
  const [currentView, setCurrentView] = useState(!isMobileView ? 3 : 1);
  const openModal = (locationIndex: number) => {
    const location =
      "ok" in locations && locationIndex !== undefined
        ? locations.ok[locationIndex]
        : undefined;
    enqueueAnalyticsEvent("Healthpoint location selected", {
      locationName: location ? location.name : "",
      radiusKm,
    });
    setSelectedLocation(locationIndex);
  };

  const clearSelectedLocation = () => {
    setSelectedLocation(undefined);
  };

  const loadMore = () => {
    setCurrentView((latest) => latest + 12);
  };

  let selectedHealthpoint: HealthpointLocation | undefined;
  let selectedCrowdsourced: CrowdsourcedLocation | undefined;
  if ("ok" in locations && selectedLocationIndex !== undefined) {
    const selected = locations.ok[selectedLocationIndex];
    if ("isHealthpoint" in selected) {
      selectedHealthpoint = selected;
    } else {
      selectedCrowdsourced = selected;
    }
  }

  return "error" in locations ||
    ("ok" in locations && locations.ok.length === 0) ? null : (
    <div>
      <WalkModal
        clearSelectedLocation={clearSelectedLocation}
        location={selectedHealthpoint}
        radiusKm={radiusKm}
      />
      <CrowdsourcedModal
        clearSelectedLocation={clearSelectedLocation}
        location={selectedCrowdsourced}
      />
      <div className="WalkSection">
        <h2>
          <Trans
            i18nKey="walkins.sectionHeader"
            t={t}
            components={[<strong></strong>]}
          />
        </h2>
      </div>
      {"loading" in locations ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "20vh",
            width: "100%",
            backgroundColor: "white",
          }}
        >
          <Spinner color="black" />
          <div
            style={{
              marginLeft: "1rem",
              fontSize: "1.5rem",
            }}
          >
            {t("core.loading")}
          </div>
        </div>
      ) : (
        <>
          <OtherContainer>
            {locations.ok
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
                    <OtherBox onClick={() => openModal(index)} key={index}>
                      <section className="WalkItem">
                        <div>
                          <h3>
                            {name}
                            {instructions.includes(Instruction.walkIn) && (
                              <FontAwesomeIcon icon={faWalking} />
                            )}
                            {instructions.includes(
                              Instruction.driveThrough
                            ) && <FontAwesomeIcon icon={faCar} />}
                          </h3>
                          {locationLat && locationLng && (
                            <p>
                              {t("core.kmAway", {
                                distance:
                                  Math.round(
                                    getDistanceKm(coords, {
                                      lat: locationLat,
                                      lng: locationLng,
                                    }) * 10
                                  ) / 10,
                              })}
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
                        src="./arrow-right-1.svg"
                        alt=""
                      />
                    </OtherBox>
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
    </div>
  );
}
