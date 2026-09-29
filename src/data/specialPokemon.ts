export type SpecialKind = "legendary" | "mythical";
export type SpecialPokemonRow = readonly [number, string];

export const SPECIAL_POKEMON: Readonly<Record<SpecialKind, readonly SpecialPokemonRow[]>> = Object.freeze({
  legendary: [
    [144, "articuno"], [145, "zapdos"], [146, "moltres"], [150, "mewtwo"],
    [243, "raikou"], [244, "entei"], [245, "suicune"], [249, "lugia"], [250, "ho-oh"],
    [377, "regirock"], [378, "regice"], [379, "registeel"], [380, "latias"], [381, "latios"],
    [382, "kyogre"], [383, "groudon"], [384, "rayquaza"],
    [480, "uxie"], [481, "mesprit"], [482, "azelf"], [483, "dialga"], [484, "palkia"],
    [485, "heatran"], [486, "regigigas"], [487, "giratina"], [488, "cresselia"],
    [638, "cobalion"], [639, "terrakion"], [640, "virizion"], [641, "tornadus"], [642, "thundurus"],
    [643, "reshiram"], [644, "zekrom"], [645, "landorus"], [646, "kyurem"],
    [716, "xerneas"], [717, "yveltal"], [718, "zygarde"],
    [772, "type-null"], [773, "silvally"],
    [785, "tapu-koko"], [786, "tapu-lele"], [787, "tapu-bulu"], [788, "tapu-fini"],
    [789, "cosmog"], [790, "cosmoem"], [791, "solgaleo"], [792, "lunala"], [800, "necrozma"],
    [888, "zacian"], [889, "zamazenta"], [890, "eternatus"], [891, "kubfu"], [892, "urshifu"],
    [894, "regieleki"], [895, "regidrago"], [896, "glastrier"], [897, "spectrier"], [898, "calyrex"],
    [905, "enamorus"],
    [1001, "wo-chien"], [1002, "chien-pao"], [1003, "ting-lu"], [1004, "chi-yu"],
    [1007, "koraidon"], [1008, "miraidon"],
    [1014, "okidogi"], [1015, "munkidori"], [1016, "fezandipiti"], [1017, "ogerpon"], [1024, "terapagos"],
  ],
  mythical: [
    [151, "mew"], [251, "celebi"], [385, "jirachi"], [386, "deoxys"],
    [489, "phione"], [490, "manaphy"], [491, "darkrai"], [492, "shaymin"], [493, "arceus"],
    [647, "keldeo"], [648, "meloetta"], [649, "genesect"],
    [719, "diancie"], [720, "hoopa"], [721, "volcanion"],
    [801, "magearna"], [802, "marshadow"], [807, "zeraora"], [808, "meltan"], [809, "melmetal"],
    [893, "zarude"], [1025, "pecharunt"],
  ],
});
