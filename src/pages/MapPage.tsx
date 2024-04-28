import {
  LeafletMap,
  Map,
  MapEvents,
  MapRef,
  Marker,
  Popup,
} from "../components/Map";
import { useCreatePoint, useEvolu, useLocalPoints } from "../localDb";
import { Effect, Either, Exit } from "effect";
import { TreeFormatter } from "@effect/schema";
import * as Evolu from "@evolu/react";
import { FC, useRef, useState } from "react";
import * as S from "@effect/schema/Schema";
import { Menu } from "../components/ui/Menu";
import { IconDotsVertical, IconCopy, IconCopyPlus } from "@tabler/icons-react";
import { cn } from "../components/utils/cn";
import { Clipboard } from "@ark-ui/react";

export default function MapPage() {
  const { points } = useLocalPoints();

  const createPoint = useCreatePoint();

  const mapRef = useRef<LeafletMap | null>(null);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 relative">
        <Map>
          <MapRef ref={mapRef} />
          <MapEvents
            click={({ latlng: { lat, lng } }) => {
              prompt(Evolu.NonEmptyString1000, "new point name", (name) => {
                createPoint({ latitude: lat, longitude: lng, name }).pipe(
                  Either.match({
                    onLeft: (error) => {
                      alert(TreeFormatter.formatErrors(error.errors));
                    },
                    onRight: () => 0,
                  }),
                );
              });
            }}
          />

          {points.map((point) => {
            const { id, latitude, longitude, name } = point;

            return (
              <Marker
                key={id}
                position={{ lat: Number(latitude), lng: Number(longitude) }}
                eventHandlers={{
                  click: () =>
                    mapRef.current?.panTo({
                      lat: Number(latitude),
                      lng: Number(longitude),
                    }),
                }}
              >
                <Popup>{name}</Popup>
              </Marker>
            );
          })}
        </Map>

        <div className="absolute inset-0 pointer-events-none z-[401]">
          <div className="pointer-events-auto absolute top-1 right-1">
            <TopMenu />
          </div>
        </div>
      </div>
    </div>
  );
}

const prompt = <From extends string, To>(
  schema: S.Schema<From, To>,
  message: string,
  onSuccess: (value: To) => void,
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

function TopMenu() {
  const evolu = useEvolu();
  const owner = Evolu.useOwner();

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
          }),
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
    <Menu positioning={{ shift: 32 }}>
      <Menu.Trigger asChild>
        <button className="bg-white py-2 px-1 rounded-sm">
          <IconDotsVertical />
        </button>
      </Menu.Trigger>

      <Menu.Positioner>
        <Menu.Content className="cursor-pointer">
          <Menu.ItemGroup id="group-1">
            <Menu.ItemGroupLabel htmlFor="group-1">
              Offline MiniMap
            </Menu.ItemGroupLabel>

            <Menu.Separator />

            <Menu.Item
              id="mnemonic"
              className={cn(showMnemonic && "h-20")}
              asChild
            >
              {showMnemonic ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowMnemonic(false);
                    }}
                    className="w-full py-1"
                  >{`Hide Mnemonic`}</button>
                  {showMnemonic && owner != null && (
                    <div>
                      <Clipboard.Root value={owner.mnemonic}>
                        <Clipboard.Control>
                          <Clipboard.Input asChild>
                            <textarea
                              readOnly
                              rows={2}
                              style={{ width: "320px" }}
                            />
                          </Clipboard.Input>
                          <Clipboard.Trigger>
                            <Clipboard.Indicator copied={<IconCopyPlus />}>
                              <IconCopy className="!size-10" />
                            </Clipboard.Indicator>
                          </Clipboard.Trigger>
                        </Clipboard.Control>
                      </Clipboard.Root>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowMnemonic(true);
                  }}
                >{`Show Mnemonic`}</button>
              )}
            </Menu.Item>

            <Menu.Item id="about" asChild>
              <a target="_blank">About</a>
            </Menu.Item>
            <Menu.Item id="sync" asChild>
              <button onClick={() => evolu.sync()}>Sync data</button>
            </Menu.Item>
            <Menu.Item id="restore" asChild>
              <button onClick={handleRestoreOwnerClick}>Restore owner</button>
            </Menu.Item>
            <Menu.Item id="reset" asChild>
              <button onClick={handleResetOwnerClick}>Reset Owner</button>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu>
  );
}
