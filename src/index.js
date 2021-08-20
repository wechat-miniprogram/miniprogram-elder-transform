import glob from "fast-glob";
import transformFontSize from "./transformFontSize";
import transformPageMeta from "./transformPageMeta";
import transformClassSize from "./transformClassSize";
import extractImageClass from "./extractImageClass";
import fs from "fs";
import path from 'path';
import yargs from 'yargs';

async function transformWxss(cwd) {
  const entries = await glob("**/*.wxss", {cwd, absolute: true});
  for (const entry of entries) {
    const source = await fs.promises.readFile(entry, "utf8");
    const output = await transformFontSize(source, entry);
    await fs.promises.writeFile(entry, output, "utf8");
  }
}

async function transformPagesWxml(cwd) {
  const appJsonPath = path.join(cwd, 'app.json')
  if (!fs.existsSync(appJsonPath)) return;
  const appJson = JSON.parse(await fs.promises.readFile(appJsonPath, "utf8"));
  const pages = appJson.pages;
  for (const page of pages) {
    const entry = path.join(cwd, (page[0] === "/" ? "." + page : page) + ".wxml");
    const source = await fs.promises.readFile(entry, "utf8");
    const output = await transformPageMeta(source, entry);
    await fs.promises.writeFile(entry, output, "utf8");
  }
}

async function transformImageSize(cwd) {
  const wxmlEntries = await glob("**/*.wxml", {cwd, absolute: true});
  const allImageClasses = [];
  for (const wxmlEntry of wxmlEntries) {
    const wxmlSource = await fs.promises.readFile(wxmlEntry, "utf8");
    const imageClasses = await extractImageClass(wxmlSource, wxmlEntry);

    allImageClasses.push(...imageClasses);
  }

  const wxssEntries = await glob("**/*.(wxss|css|less|sass|scss)", {cwd, absolute: true});
  for (const wxssEntry of wxssEntries) {
    const wxssSource = await fs.promises.readFile(wxssEntry, "utf8");
    const output = await transformClassSize(
      wxssSource,
      allImageClasses,
      wxssEntry
    );
    await fs.promises.writeFile(wxssEntry, output, "utf8");
  }
}

const argv = yargs(process.argv.slice(2))
  .usage("$0 <baseDir>", "transform mini program source code", (yargs) => {
    yargs.positional("baseDir", {
      describe: 'directory to transform',
      type: "string",
      coerce: baseDir => path.join(process.cwd(), baseDir || ''),
    });
  })
  .argv;

async function main() {
  try {
    await transformWxss(argv.baseDir);
    await transformPagesWxml(argv.baseDir);
    await transformImageSize(argv.baseDir);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
