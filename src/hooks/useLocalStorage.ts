import { atom } from "jotai";

const isSSR = typeof window === "undefined";

const apiKeyAtom = atom(!isSSR && (localStorage.getItem("apiKey") ?? ""));
const baseIdAtom = atom(!isSSR && (localStorage.getItem("baseId") ?? ""));
const savedFileAtoms = atom(
  (!isSSR && JSON.parse(localStorage.getItem("savedFiles") || "[]")) ?? []
);

export const apiKeyAtomPersist = atom(
  (get) => (!isSSR && get(apiKeyAtom)) || "",
  (get, set, newApiKey: string) => {
    if (!isSSR) {
      set(apiKeyAtom, newApiKey);
      localStorage.setItem("apiKey", newApiKey);
    }
  }
);

export const baseIdAtomPersist = atom(
  (get) => (!isSSR && get(baseIdAtom)) || "",
  (get, set, newBaseId: string) => {
    if (!isSSR) {
      set(baseIdAtom, newBaseId);
      localStorage.setItem("baseId", newBaseId);
    }
  }
);

export const savedFileAtomsPersist = atom(
  (get) => !isSSR && get(savedFileAtoms),
  (get, set, newJSON: Object) => {
    if (!isSSR) {
      set(savedFileAtoms, [...get(savedFileAtoms), newJSON]);
      localStorage.setItem(
        "savedFiles",
        JSON.stringify([...get(savedFileAtoms), newJSON])
      );
    }
  }
);
