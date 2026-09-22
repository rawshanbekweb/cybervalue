import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  MAX_UPLOAD_BYTES,
  prepareUpload,
  readUploadBody,
} from "../src/lib/upload-validation";
import { formDataToContentInput } from "../src/lib/admin-form";

test("uploads reject executable extensions, forged file types, binary text and empty files", async () => {
  for (const [name, data] of [
    ["payload.exe", "bad"],
    ["fake.pdf", "text"],
    ["fake.zip", "text"],
    ["text.txt", "a\0b"],
    ["empty.txt", ""],
  ]) {
    await assert.rejects(prepareUpload(name, "RESOURCE", Buffer.from(data)));
  }
  await assert.rejects(
    prepareUpload("large.txt", "RESOURCE", Buffer.alloc(MAX_UPLOAD_BYTES + 1)),
  );
  await assert.rejects(
    prepareUpload("text.txt", "RESOURCE", Buffer.from([0xff, 0xfe])),
  );
  const file = await prepareUpload(
    "../notes.txt",
    "RESOURCE",
    Buffer.from("Private resource"),
  );
  assert.match(file.path, /^\/downloads\/[a-z0-9-]+\.txt$/);
  assert.equal(file.data.toString(), "Private resource");
  assert.equal(file.name.includes("/"), false);
});

test("images are decoded, normalized to WebP and constrained by supported format", async () => {
  const png = await sharp({
    create: { width: 20, height: 10, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  const image = await prepareUpload("photo.png", "IMAGE", png);
  assert.equal(image.mimeType, "image/webp");
  assert.equal(image.width, 20);
  assert.equal(image.height, 10);
  assert.equal((await sharp(image.data).metadata()).format, "webp");
  await assert.rejects(
    prepareUpload("photo.png", "IMAGE", Buffer.from("not an image")),
  );
  await assert.rejects(
    prepareUpload(
      "bad.svg",
      "IMAGE",
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    ),
  );
});

test("upload body limit is enforced without trusting content-length", async () => {
  const oversized = new Request("http://localhost/admin/uploads", {
    method: "POST",
    body: Buffer.alloc(MAX_UPLOAD_BYTES + 1),
  });
  await assert.rejects(readUploadBody(oversized), /4 MiB/);
  const empty = new Request("http://localhost/admin/uploads", {
    method: "POST",
    body: "",
  });
  await assert.rejects(readUploadBody(empty), /Empty files/);
  const valid = new Request("http://localhost/admin/uploads", {
    method: "POST",
    body: "hello",
  });
  assert.equal((await readUploadBody(valid)).toString(), "hello");
});

test("malformed image input is not silently converted into a request to delete images", () => {
  const form = new FormData();
  form.set("imagesJson", "bad-json");
  assert.equal(formDataToContentInput("resources", form).images, null);
});
