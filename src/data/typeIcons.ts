import acero from "../assets/types/acero.png";
import agua from "../assets/types/agua.png";
import bicho from "../assets/types/bicho.png";
import dragon from "../assets/types/dragon.png";
import electrico from "../assets/types/electrico.png";
import fantasma from "../assets/types/fantasma.png";
import fuego from "../assets/types/fuego.png";
import hada from "../assets/types/hada.png";
import hielo from "../assets/types/hielo.png";
import lucha from "../assets/types/lucha.png";
import normal from "../assets/types/normal.png";
import planta from "../assets/types/planta.png";
import psiquico from "../assets/types/psiquico.png";
import roca from "../assets/types/roca.png";
import siniestro from "../assets/types/siniestro.png";
import tierra from "../assets/types/tierra.png";
import veneno from "../assets/types/veneno.png";
import volador from "../assets/types/volador.png";

export const TYPE_ICON_ORDER_ES = [
  "acero",
  "agua",
  "bicho",
  "dragon",
  "electrico",
  "fantasma",
  "fuego",
  "hada",
  "hielo",
  "lucha",
  "normal",
  "planta",
  "psiquico",
  "roca",
  "siniestro",
  "tierra",
  "veneno",
  "volador",
] as const;

export const TYPE_ICON_ASSETS: Record<string, string> = {
  steel: acero,
  water: agua,
  bug: bicho,
  dragon,
  electric: electrico,
  ghost: fantasma,
  fire: fuego,
  fairy: hada,
  ice: hielo,
  fighting: lucha,
  normal,
  grass: planta,
  psychic: psiquico,
  rock: roca,
  dark: siniestro,
  ground: tierra,
  poison: veneno,
  flying: volador,
};
