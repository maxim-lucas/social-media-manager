const test = require("node:test");
const assert = require("node:assert");
const g = require("./graph");

/** A fake Graph API: records every call, answers with queued JSON bodies (or a default id). */
function fake(responses = []) {
  const calls = [];
  let n = 0;
  const fetchImpl = async (url, init = {}) => {
    calls.push({ method: init.method, url, body: init.body || null });
    const r = responses.shift() || { id: `id${++n}`, status_code: "FINISHED" };
    return { ok: !r.error, status: r.error ? 400 : 200, json: async () => r };
  };
  return { calls, fetchImpl };
}
const noSleep = async () => {};

test("a caption over 2,200 characters is refused before any call", () => {
  assert.throws(() => g.validateSlot({ kind: "carousel", assets: ["a", "b"], instagramCaption: "x".repeat(2201) }), /2201 characters/);
});
test("a carousel must have 2 to 20 slides and a reel exactly one video", () => {
  assert.throws(() => g.validateSlot({ kind: "carousel", assets: Array(21).fill("a"), instagramCaption: "x" }), /got 21/);
  assert.throws(() => g.validateSlot({ kind: "carousel", assets: ["a"], instagramCaption: "x" }), /got 1/);
  assert.throws(() => g.validateSlot({ kind: "reel", assets: ["a", "b"], instagramCaption: "x" }), /exactly one video/);
  assert.doesNotThrow(() => g.validateSlot({ kind: "carousel", assets: Array(20).fill("a"), instagramCaption: "x" }));
});

test("an Instagram carousel makes one child per slide, then the parent, then publishes the parent", async () => {
  const { calls, fetchImpl } = fake();
  const id = await g.postIgCarousel({ fetchImpl, igId: "IG", token: "T", imageUrls: ["u1", "u2", "u3"], caption: "cap", sleep: noSleep });
  const posts = calls.filter((c) => c.method === "POST");
  assert.strictEqual(posts.length, 5); // 3 children + parent + publish
  assert.match(posts[3].body, /media_type=CAROUSEL/);
  assert.match(posts[3].body, /children=id1%2Cid2%2Cid3/);
  assert.match(posts[4].url, /IG\/media_publish/);
  assert.match(posts[4].body, /creation_id=id4/);
  assert.ok(id);
});

test("it waits for the container to finish and fails clearly on ERROR", async () => {
  const { fetchImpl } = fake([{ id: "c1" }, { id: "c2" }, { id: "p" }, { status_code: "ERROR", status: "Media upload has failed" }]);
  await assert.rejects(() => g.postIgCarousel({ fetchImpl, igId: "IG", token: "T", imageUrls: ["u1", "u2"], caption: "c", sleep: noSleep }), /ERROR: Media upload has failed/);
});

test("a Graph error becomes a GraphError with Meta's message and code", async () => {
  const { fetchImpl } = fake([{ error: { message: "Invalid OAuth access token", code: 190 } }]);
  await assert.rejects(() => g.postIgReel({ fetchImpl, igId: "IG", token: "bad", videoUrl: "v", caption: "c", sleep: noSleep }), /Invalid OAuth access token \(code 190\)/);
});

test("an Instagram reel posts REELS with the video url and shares to the feed", async () => {
  const { calls, fetchImpl } = fake();
  await g.postIgReel({ fetchImpl, igId: "IG", token: "T", videoUrl: "https://x/v.mp4", caption: "c", sleep: noSleep });
  assert.match(calls[0].body, /media_type=REELS/);
  assert.match(calls[0].body, /video_url=https%3A%2F%2Fx%2Fv.mp4/);
  assert.match(calls[0].body, /share_to_feed=true/);
});

test("a Facebook photo post uploads each photo unpublished, then one feed post attaching them all", async () => {
  const { calls, fetchImpl } = fake();
  await g.postFbPhotos({ fetchImpl, pageId: "P", token: "T", imageUrls: ["u1", "u2"], message: "m" });
  assert.strictEqual(calls.length, 3);
  assert.match(calls[0].body, /published=false/);
  assert.match(calls[2].url, /P\/feed/);
  assert.match(decodeURIComponent(calls[2].body), /attached_media=\[\{"media_fbid":"id1"\},\{"media_fbid":"id2"\}\]/);
});
