import { Coords } from "../location-picker/LocationPicker";
import { getDistanceKm } from "../utils/distance";
import {
  CrowdsourcedLocation,
  useCrowdsourcedLocations,
} from "../crowdsourced/CrowdsourcedData";
import {
  useHealthpointLocations,
  HealthpointLocation,
} from "./healthpoint/HealthpointData";

export type TodayLocation = CrowdsourcedLocation | HealthpointLocation;

export const useTodayLocationsData = (coords: Coords, radiusKm: number) => {
  const locations = useHealthpointLocations(coords, radiusKm);
  const crowdSourced = useCrowdsourcedLocations(coords, radiusKm);
  if ("ok" in locations) {
    const combined = [...crowdSourced, ...locations.ok];
    combined.sort(
      (
        { lat: locationALat, lng: locationALng },
        { lat: locationBLat, lng: locationBLng }
      ) => {
        const distanceKmLocationA = getDistanceKm(coords, {
          lat: locationALat,
          lng: locationALng,
        });
        const distanceKmLocationB = getDistanceKm(coords, {
          lat: locationBLat,
          lng: locationBLng,
        });
        return distanceKmLocationA - distanceKmLocationB;
      }
    );
    return { ok: combined };
  } else {
    return locations;
  }
};
