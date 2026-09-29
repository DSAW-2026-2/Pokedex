import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App v16", () => {
  it("muestra una pantalla de inicio que explica las opciones principales", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /pokécheck/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /qué quieres descubrir hoy/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /buscar pokémon/i })).toBeInTheDocument();
    expect(screen.getByText("Explorar por generación")).toBeInTheDocument();
    expect(screen.getByText("Comparar Pokémon")).toBeInTheDocument();
  });

  it("mantiene la Pokédex completa en /pokedex", () => {
    render(
      <MemoryRouter initialEntries={["/pokedex"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("searchbox", { name: /nombre o número/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^todos$/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /categoría/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();
  });
});
