import {
  LeafletEventHandlerFnMap,
  Map as LeafletMap,
} from "leaflet";
import type { ComponentProps, ReactNode } from "react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { MapContainerProps } from "react-leaflet";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export { Marker, Popup, LeafletMap };

export const MapBoundsUpdater = ({
  bounds,
}: {
  bounds: L.LatLngBounds | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      requestAnimationFrame(() => {
        map.fitBounds(bounds);
      });
    }
  }, [bounds, map]);

  return null;
};

export const MapCenterUpdater = ({
  center,
  zoom,
}: {
  center: [number, number] | null;
  zoom?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      requestAnimationFrame(() => {
        map.setView(center, zoom ?? map.getZoom(), { animate: true });
      });
    }
  }, [center, map, zoom]);

  return null;
};

export const MapRef = forwardRef<LeafletMap, {}>(function Forwarded(_, ref) {
  const map = useMap();

  useImperativeHandle(ref, () => map, [map]);

  return null;
});

export const MapEvents = (props: LeafletEventHandlerFnMap) => {
  useMapEvents(props);
  return null;
};

export const Map = (
  props: {
    children?: ReactNode;
    zoom?: number;
    tileLayerProps?: Partial<ComponentProps<typeof TileLayer>>;
    onMapReady?: (map: L.Map) => void;
  } & MapContainerProps
) => {
  const {
    children,
    center = [48.8308228, 2.2765887],
    zoom = 3,
    maxZoom = 18,
    tileLayerProps,
    onMapReady,
    whenReady,
    ...mapProps
  } = props;

  const mapRef = useRef<L.Map>(null!);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (isMapReady) {
      onMapReady?.(mapRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);

  return (
    <MapContainer
      className="w-full h-full"
      attributionControl={false}
      maxZoom={maxZoom}
      minZoom={2}
      maxBounds={[
        [90, -180],
        [-90, 180],
      ]}
      maxBoundsViscosity={1}
      center={center}
      zoom={zoom}
      whenReady={() => {
        setIsMapReady(true);
        whenReady?.();
      }}
      {...mapProps}
    >
      <TileLayer
        {...tileLayerProps}
        // url="https://nginx-cache.fly.dev/{s}/{z}/{x}/{y}.png"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        crossOrigin="anonymous"
      />
      {children}
      <MapRef ref={mapRef} />
    </MapContainer>
  );
};
