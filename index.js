import { run, bench, group } from "mitata";

import Keyv from "keyv";
import NodeCache from "node-cache";
import TTLCache from "@isaacs/ttlcache";
import dummyCacheObj from "./dummy.json" assert { type: "json" };

const ITEMS_IN_CACHE = 500_000;
const GET_NUMBER_OF_ITEMS = 50_000;

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
    await keyvInstance.set("key" + i, JSON.parse(DUMMY_JSON), TTL);
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
    nodeCacheInstance.set("key" + i, JSON.parse(DUMMY_JSON), TTL);
  }

  return (id) => nodeCacheInstance.get(id);
})();

const ttlCache = await (async () => {
  const ttlCacheInstance = new TTLCache({ max: ITEMS_IN_CACHE, ttl: TTL });

  for (let i = 0; i < ITEMS_IN_CACHE; i++) {
    ttlCacheInstance.set("key" + i, JSON.parse(DUMMY_JSON), { ttl: TTL });
  }

  return (id) => ttlCacheInstance.get(id);
})();

group("group", () => {
  bench("keyv", () => getItems(keyv));
  bench("node-cache", () => getItems(nodeCache));
  bench("ttlCache", () => getItems(ttlCache));
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
