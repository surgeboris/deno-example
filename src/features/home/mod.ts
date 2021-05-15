import { router } from "src/router.ts";
import { setupRenderer } from "src/templatingEngine.ts";

const render = setupRenderer(import.meta.url);

router.get("/", async (ctx) => {
  const announcements = await Deno.readTextFile("./announcements.html");
  render("./home.eta", { ctx }, { announcements });
});
