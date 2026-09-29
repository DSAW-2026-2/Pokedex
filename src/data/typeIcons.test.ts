import { describe, expect, it } from "vitest";
import { TYPE_ICON_ASSETS, TYPE_ICON_ORDER_ES } from "./typeIcons";

describe("type icon assets", () => {
  it("maps the 18 Pokémon types to the user-provided alphabetical icon strip", () => {
    expect(TYPE_ICON_ORDER_ES).toEqual([
      "acero", "agua", "bicho", "dragon", "electrico", "fantasma", "fuego", "hada", "hielo",
      "lucha", "normal", "planta", "psiquico", "roca", "siniestro", "tierra", "veneno", "volador",
    ]);
    expect(Object.keys(TYPE_ICON_ASSETS)).toHaveLength(18);
    expect(TYPE_ICON_ASSETS.steel).toContain("acero");
    expect(TYPE_ICON_ASSETS.water).toContain("agua");
    expect(TYPE_ICON_ASSETS.flying).toContain("volador");
  });
});
