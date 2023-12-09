import { Map, MapEvents, Marker, Popup } from "../components/Map";
import { createPoint, useLocalPoints } from "../localDb";
import { Either } from "effect";
import { TreeFormatter } from "@effect/schema";

export default function MapPage() {
  const { points } = useLocalPoints();

  console.log({ points });

  return (
    <div className="flex-1">
      <div className="flex gap-2"></div>
      <Map>
        <MapEvents
          click={({ latlng: { lat, lng } }) => {
            const name = prompt("new point name") as any;

            createPoint({ latitude: lat, longitude: lng, name }).pipe(
              Either.match({
                onLeft: (error) => {
                  alert(TreeFormatter.formatErrors(error.errors));
                },
                onRight: () => 0,
              })
            );
          }}
        />

        {points.map((point) => {
          const { id, latitude, longitude, name } = point;

          return (
            <Marker key={id} position={{ lat: latitude, lng: longitude }}>
              <Popup>{name}</Popup>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
