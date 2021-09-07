import { Button, KIND } from "baseui/button";
import { formatDistance } from "date-fns";
import { FunctionComponent, useEffect, useState } from "react";
import RadiusSelect from "../RadiusSelect";
import { useSearchParams } from "../utils/url";
import { HeaderMain } from "../VaxComponents";
import LocationModal from "./LocationModal";

export interface Coords {
  lng: number;
  lat: number;
}

interface LocationPickerProps {
  coords: Coords;
  setCoords: (coords: Coords) => void;
  radiusKm: number;
  setRadiusKm: (radiusKm: number) => void;
  lastUpdateTime: Date | null;
}

export const useDefaultCoords = (): Coords => {
  const { lat: urlLat, lng: urlLng } = useSearchParams();
  const defaultLat = urlLat ? parseFloat(urlLat) : -36.853610199274385;
  const defaultLng = urlLng ? parseFloat(urlLng) : 174.76054541484535;

  return {
    lat: defaultLat,
    lng: defaultLng,
  };
};

const useDefaultPlaceName = () => {
  const { placeName: urlPlaceName } = useSearchParams();
  return urlPlaceName ?? "Auckland CBD";
};

export const LocationPicker: FunctionComponent<LocationPickerProps> = ({
  coords,
  setCoords,
  radiusKm,
  setRadiusKm,
  lastUpdateTime,
}) => {
  const defaultCoords = useDefaultCoords();
  const defaultPlaceName = useDefaultPlaceName();
  const [placeName, setPlaceName] = useState(defaultPlaceName);
  useEffect(() => setPlaceName(defaultPlaceName), [defaultPlaceName]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <LocationModal
        locationIsOpen={isOpen}
        setLocationIsOpen={setIsOpen}
        setCoords={setCoords}
        setPlaceName={setPlaceName}
      />

      <HeaderMain>
        <section>
          <h1>
            Available Vaccine Slots
            <strong>{placeName ? " near " + placeName : ""}</strong>
          </h1>
          <p>
            Last updated{" "}
            {lastUpdateTime === null
              ? "..."
              : formatDistance(lastUpdateTime, new Date(), {
                  addSuffix: true,
                })}
          </p>
        </section>

        <div>
          <Button
            kind={KIND.primary}
            onClick={() => setIsOpen(true)}
            overrides={{
              BaseButton: {
                style: {
                  minWidth: "220px",
                },
              },
            }}
          >
            {coords.lat === defaultCoords.lat &&
            coords.lng === defaultCoords.lng
              ? "Set your Location"
              : "Location Set"}
          </Button>
          <RadiusSelect value={radiusKm} setValue={setRadiusKm} />
        </div>
      </HeaderMain>
    </>
  );
};
