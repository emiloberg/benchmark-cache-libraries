import { run, bench, group } from "mitata";

import Keyv from "keyv";
import NodeCache from "node-cache";
import TTLCache from "@isaacs/ttlcache";
import dummyCacheObj from "./dummy.json" assert { type: "json" };

const ITEMS_IN_CACHE = 2_000_000;
const GET_NUMBER_OF_ITEMS = 100;

const DUMMY_JSON = JSON.stringify(dummyCacheObj);
const TTL = 60_000;

const KEYS = Array.from({ length: GET_NUMBER_OF_ITEMS }, () =>
  Math.floor(Math.random() * ITEMS_IN_CACHE + 1)
);

const getItems = async (getFn) => {
  for (const key of KEYS) {
    await getFn("key" + key);
  }
};

const keyv = await (async () => {
  const keyvInstance = new Keyv();
  for (let i = 0; i < ITEMS_IN_CACHE; i++) {
    await keyvInstance.set("key" + i, "data", TTL);
  }

  return (id) => keyvInstance.get(id);
})();

const nodeCache = await (async () => {
  const nodeCacheInstance = new NodeCache({
    stdTTL: TTL,
    checkperiod: 10,
    useClones: false,
  });

  for (let i = 0; i < ITEMS_IN_CACHE; i++) {
    nodeCacheInstance.set("key" + i, "data", TTL);
  }

  return (id) => nodeCacheInstance.get(id);
})();

const str = "true";

group("group", () => {
  bench("bangbang", () => !!str);
  bench("boolean", () => Boolean(str));
});

await run({
  units: false,
  silent: false,
  avg: true,
  json: false,
  colors: true,
  min_max: true,
  percentiles: true,
});
