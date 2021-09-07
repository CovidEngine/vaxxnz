import { Button, KIND } from "baseui/button";
import { Spinner } from "baseui/spinner";
import { formatDistance, parse } from "date-fns";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  HeaderMain,
  CalendarContainer,
  CalendarSectionContainer,
  MonthContainer,
} from "./VaxComponents";
import { ShareButtons } from "./ShareButtons";

import { DateLocationsPairsContext } from "./contexts";
import { getMyCalendar } from "./getData";
import { DateLocationsPair } from "./types";
import LocationModal from "./LocationModal";
import BookingsModal from "./BookingsModal";

import RadiusSelect from "./RadiusSelect";
import { useSearchParams } from "./urlUtils";
import { WalkInSection } from "./WalkSection";
import filterOldDates from "./filterOldDates";

function sum(array: number[]) {
  return array.reduce((a, b) => a + b, 0);
}

function App() {
  const {
    lat: urlLat,
    lng: urlLng,
    placeName: urlPlaceName,
  } = useSearchParams();
  const defaultLat = urlLat ? parseFloat(urlLat) : -36.853610199274385;
  const defaultLng = urlLng ? parseFloat(urlLng) : 174.76054541484535;
  const defaultPlaceName = urlPlaceName ?? "Auckland CBD";

  const [isOpen, setIsOpen] = React.useState<DateLocationsPair | null>(null);
  const [locationIsOpen, setLocationIsOpen] = React.useState<boolean>(false);

  const [radiusKm, setRadiusKm] = useState(10);
  const [coords, setCoords] = useState<[number, number]>([
    defaultLat,
    defaultLng,
  ]);
  const [placeName, setPlaceName] = useState(defaultPlaceName);

  useEffect(() => {
    setCoords([defaultLat, defaultLng]);
    setPlaceName(defaultPlaceName);
  }, [defaultLat, defaultLng, defaultPlaceName]);

  const {
    dateLocationsPairs: dateLocationsPairsUnfiltered,
    setDateLocationsPairs,
  } = useContext(DateLocationsPairsContext);
  const dateLocationsPairs = filterOldDates(dateLocationsPairsUnfiltered);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date(0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCalendar(coords[0], coords[1], radiusKm);
      setDateLocationsPairs(data.dateLocationsPairs);
      setLastUpdateTime(
        data.oldestLastUpdatedTimestamp === Infinity
          ? new Date(0)
          : new Date(data.oldestLastUpdatedTimestamp)
      );
    } catch (error) {
      setError(error as Error);
    }
    setLoading(false);
  }, [coords, radiusKm, setDateLocationsPairs]);

  const openLocation = () => {
    setLocationIsOpen(true);
  };

  let byMonth = new Map<string, DateLocationsPair[]>();
  dateLocationsPairs.forEach((dateLocationsPair) => {
    const date = parse(dateLocationsPair.dateStr, "yyyy-MM-dd", new Date());
    const month = date.toLocaleString("en-NZ", {
      month: "long",
      year: "numeric",
    });
    const arrayToPush = byMonth.get(month) ?? [];
    arrayToPush.push(dateLocationsPair);
    byMonth.set(month, arrayToPush);
  });

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  return (
    <>
      <div className="App">
        <BookingsModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          lat={coords[0]}
          lng={coords[1]}
        />
        <LocationModal
          locationIsOpen={locationIsOpen}
          setLocationIsOpen={setLocationIsOpen}
          setCoords={setCoords}
          setPlaceName={setPlaceName}
        />

        <section className="App-header">
          <a href="/" className="nolink">
            <h1>NZ COVID Vaccination Finder</h1>
          </a>{" "}
          <h3 style={{ fontWeight: "normal" }}>
            See every available vaccination booking slot near you.{" "}
          </h3>{" "}
          <br />
          <p>
            This is not an official Government website.
            <br /> To get vaccinated visit&nbsp;
            <a href="https://bookmyvaccine.nz" target="_blank" rel="noreferrer">
              bookmyvaccine.nz
            </a>{" "}
            <br />
          </p>
        </section>
        <div className={"big-old-container"}>
          <HeaderMain>
            <section>
              <h1>
                Available Vaccine Slots
                <strong>{placeName ? " near " + placeName : ""}</strong>
              </h1>
              <p>
                Last updated{" "}
                {lastUpdateTime.getFullYear() === 1970
                  ? "..."
                  : formatDistance(lastUpdateTime, new Date(), {
                      addSuffix: true,
                    })}
              </p>
            </section>

            <div>
              <Button
                kind={KIND.primary}
                onClick={() => openLocation()}
                overrides={{
                  BaseButton: {
                    style: {
                      minWidth: "220px",
                    },
                  },
                }}
              >
                {coords[0] === defaultLat && coords[1] === defaultLng
                  ? "Set your Location"
                  : "Location set"}
              </Button>
              <RadiusSelect value={radiusKm} setValue={setRadiusKm} />
            </div>
          </HeaderMain>
          <WalkInSection lat={coords[0]} lng={coords[1]} radiusKm={radiusKm} />
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
              <Spinner color="black" />
              <div
                style={{
                  marginLeft: "1rem",
                  fontSize: "1.5rem",
                }}
              >
                Loading...
              </div>
            </div>
          ) : null}

          {!loading && !error ? (
            <CalendarContainer>
              {Array.from(byMonth.entries()).map(
                ([month, dateLocationsPairsForMonth]) => (
                  <CalendarSectionContainer key={month}>
                    <div className="MonthSection">
                      <h2>{month}</h2>{" "}
                    </div>
                    <MonthContainer>
                      {dateLocationsPairsForMonth.map((dateLocationsPair) => (
                        <button
                          className={
                            sum(
                              dateLocationsPair.locationSlotsPairs.map(
                                (locationSlotsPair) =>
                                  (locationSlotsPair.slots || []).length
                              )
                            ) === 0
                              ? "zero-available"
                              : ""
                          }
                          key={dateLocationsPair.dateStr}
                          onClick={() => setIsOpen(dateLocationsPair)}
                        >
                          <div>
                            <h3>
                              {parse(
                                dateLocationsPair.dateStr,
                                "yyyy-MM-dd",
                                new Date()
                              ).toLocaleDateString([], {
                                day: "numeric",
                              })}{" "}
                              {parse(
                                dateLocationsPair.dateStr,
                                "yyyy-MM-dd",
                                new Date()
                              ).toLocaleDateString([], {
                                month: "short",
                              })}
                              <br />{" "}
                              <aside aria-hidden="true">
                                {parse(
                                  dateLocationsPair.dateStr,
                                  "yyyy-MM-dd",
                                  new Date()
                                ).toLocaleDateString([], {
                                  weekday: "short",
                                })}
                              </aside>
                            </h3>
                            <p>
                              {sum(
                                dateLocationsPair.locationSlotsPairs.map(
                                  (locationSlotsPair) =>
                                    (locationSlotsPair.slots || []).length
                                )
                              )}{" "}
                              available
                              {/* Ternary statement to display number of vaccination centres if > 0. We need to use a map as there are some cases where locationSlotsPairs has entries
                              but the nested slots field is empty. */}
                              {sum(
                                dateLocationsPair.locationSlotsPairs.map(
                                  (locationSlotsPair) => {
                                    return (locationSlotsPair.slots || [])
                                      .length > 0
                                      ? 1
                                      : 0;
                                  }
                                )
                              ) < 1 ? null : (
                                <div>
                                  {dateLocationsPair.locationSlotsPairs.length}{" "}
                                  vaccination centres
                                </div>
                              )}
                            </p>
                          </div>
                          <img src="./arrow.svg" aria-hidden="true" alt="" />
                        </button>
                      ))}
                    </MonthContainer>
                  </CalendarSectionContainer>
                )
              )}
            </CalendarContainer>
          ) : null}
        </div>
        {!loading && error ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "1rem",
            }}
          >
            {/* <Spinner color="black" /> */}
            <div style={{ marginLeft: "1rem", fontSize: "1.5rem" }}>
              {error.message}
            </div>
          </div>
        ) : null}

        <section className="App-header">
          <p style={{ marginBottom: "0.5rem" }}>
            If this site helped you please consider sharing:
          </p>
          <div className={"social-container"}>
            <ShareButtons />
          </div>
          <br />
          <p>
            <a
              href="https://airtable.com/shrxuw3vSp2yRPrG7"
              target="_blank"
              rel="noreferrer"
            >
              Contact us
            </a>{" "}
            /{" "}
            <a
              href="https://github.com/CovidEngine/vaxxnzlocations"
              target="_blank"
              rel="noreferrer"
            >
              Raw Data
            </a>{" "}
            /{" "}
            <a
              href="https://github.com/CovidEngine/vaxxnz"
              target="_blank"
              rel="noreferrer"
            >
              Source code
            </a>{" "}
            /{" "}
            <a
              href="https://github.com/CovidEngine/vaxxnz/projects/2"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Roadmap
            </a>
          </p>
          <p></p>
        </section>
      </div>
    </>
  );
}

export default App;
