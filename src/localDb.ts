import * as S from "@effect/schema/Schema";
import * as Evolu from "@evolu/react";
import { Either } from "effect";

const PointId = Evolu.id("PointId");
type PointId = S.Schema.To<typeof PointId>;

const stringFromNumber = S.transform(S.string, String, Number);

const Latitude = S.number.pipe(S.between(-90, 90), stringFromNumber);
type Latitude = S.Schema.From<typeof Latitude>;

const Longitude = S.number.pipe(S.between(-180, 180), stringFromNumber);
type Longitude = S.Schema.From<typeof Longitude>;

const PointsTable = S.struct({
  id: PointId,
  name: Evolu.NonEmptyString1000,
  latitude: Latitude,
  longitude: Longitude,
});

type PointsTable = S.Schema.To<typeof PointsTable>;

const PointInput = PointsTable.pipe(S.omit("id"));

type PointInput = S.Schema.From<typeof PointInput>;

const Database = S.struct({
  points: PointsTable,
});

type Database = S.Schema.To<typeof Database>;

export const evolu = Evolu.createEvolu(Database, {
  // syncUrl: "https://remix-evolu.fly.dev",
});

export const useEvolu = Evolu.useEvolu<Database>;

const getPoints = evolu.createQuery((db) =>
  db
    .selectFrom("points")
    .where("latitude", "is not", null)
    .where("longitude", "is not", null)
    .selectAll()
    .$narrowType<PointsTable>()
);

export const useCreatePoint = () => {
  const { create } = useEvolu();

  return (point: PointInput) =>
    S.decodeEither(PointInput)(point).pipe(
      Either.map((point) => create("points", point))
    );
};

export const useLocalPoints = () => {
  const { rows } = Evolu.useQuery(getPoints);

  return { points: rows };
};

evolu.subscribeError(() => {
  console.log("evolu error");
  console.log({ error: evolu.getError() });
});
