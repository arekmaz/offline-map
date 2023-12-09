import { Map, MapEvents, Marker, Popup } from "../components/Map";
import { useCreatePoint, useEvolu, useLocalPoints } from "../localDb";
import { Effect, Either, Exit } from "effect";
import { TreeFormatter } from "@effect/schema";
import * as Evolu from "@evolu/react";
import { FC, useState } from "react";
import * as S from "@effect/schema/Schema";

export default function MapPage() {
  const { points } = useLocalPoints();

  const createPoint = useCreatePoint();

  console.log({ points });

  return (
    <div className="flex-1">
      <div className="flex gap-2">
        <OwnerActions />

        <p>{points.length} points</p>
      </div>
      <Map>
        <MapEvents
          click={({ latlng: { lat, lng } }) => {
            prompt(Evolu.NonEmptyString1000, "new point name", (name) => {
              createPoint({ latitude: lat, longitude: lng, name }).pipe(
                Either.match({
                  onLeft: (error) => {
                    alert(TreeFormatter.formatErrors(error.errors));
                  },
                  onRight: () => 0,
                })
              );
            });
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

const OwnerActions: FC = () => {
  const evolu = useEvolu();
  const owner = Evolu.useOwner();

  console.log({ owner, o: evolu.getOwner() });
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleRestoreOwnerClick = (): void => {
    prompt(Evolu.NonEmptyString1000, "Your Mnemonic", (mnemonic) => {
      Evolu.parseMnemonic(mnemonic)
        .pipe(Effect.runPromiseExit)
        .then(
          Exit.match({
            onFailure: (error) => {
              alert(JSON.stringify(error, null, 2));
            },
            onSuccess: (mnemonic) => {
              isRestoringOwner(true);
              evolu.restoreOwner(mnemonic);
            },
          })
        );
    });
  };

  const handleResetOwnerClick = (): void => {
    if (confirm("Are you sure? It will delete all your local data.")) {
      isRestoringOwner(false);
      evolu.resetOwner();
    }
  };

  return (
    <div className="flex gap-2 flex-col">
      <p>
        Open this page on a different device and use your mnemonic to restore
        your data.
      </p>

      <div className="flex gap-1 items-start p-3 justify-evenly">
        <div className="flex flex-col gap-1">
          <button onClick={(): void => setShowMnemonic(!showMnemonic)}>{`${
            showMnemonic ? "Hide" : "Show"
          } Mnemonic`}</button>
          {showMnemonic && owner != null && (
            <div>
              <textarea
                value={owner.mnemonic}
                readOnly
                rows={2}
                style={{ width: "320px" }}
              />
            </div>
          )}
        </div>

        <button onClick={handleRestoreOwnerClick}>restore owner</button>
        <button onClick={handleResetOwnerClick}>Reset Owner</button>
        <button onClick={() => evolu.sync()}>sync data</button>
      </div>
    </div>
  );
};

const prompt = <From extends string, To>(
  schema: S.Schema<From, To>,
  message: string,
  onSuccess: (value: To) => void
): void => {
  const value = window.prompt(message);
  if (value == null) return; // on cancel
  const a = S.parseEither(schema)(value);
  if (a._tag === "Left") {
    alert(TreeFormatter.formatErrors(a.left.errors));
    return;
  }
  onSuccess(a.right);
};

const isRestoringOwner = (isRestoringOwner?: boolean): boolean => {
  if (!Evolu.canUseDom) return false;
  const key = 'evolu:isRestoringOwner"';
  if (isRestoringOwner != null)
    localStorage.setItem(key, String(isRestoringOwner));
  return localStorage.getItem(key) === "true";
};
