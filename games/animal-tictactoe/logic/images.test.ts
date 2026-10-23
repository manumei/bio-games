import { describe, expect, it } from "vitest";
import type { Animal } from "../data/animals";
import { resolveAnimalImage } from "./images";

describe("resolveAnimalImage", () => {
  it("returns custom game image path when animal.image is set", () => {
    const animal: Animal = {
      id: "custom_fox",
      name: "Custom Fox",
      aliases: ["Fox"],
      image: "fox.webp",
      scientificName: "Vulpes vulpes",
      traits: ["mammal", "omnivore"],
    };
    expect(resolveAnimalImage(animal)).toBe(
      "/assets/webp/games/animal-tictactoe/fox.webp",
    );
  });

  it("returns Taxo organism WebP path when scientificName matches organisms.json", () => {
    const lion: Animal = {
      id: "lion",
      name: "Lion",
      aliases: ["African Lion"],
      scientificName: "Panthera leo",
      traits: ["mammal", "carnivorous"],
    };
    expect(resolveAnimalImage(lion)).toBe(
      "/assets/webp/games/taxo/eukaryota/animalia/chordata/mammalia/carnivora/panthera_leo.webp",
    );
  });

  it("returns null when neither image nor matching Taxo organism exists", () => {
    const cheetah: Animal = {
      id: "cheetah",
      name: "Cheetah",
      aliases: ["Acinonyx jubatus"],
      scientificName: "Acinonyx jubatus",
      traits: ["mammal", "carnivorous"],
    };
    expect(resolveAnimalImage(cheetah)).toBeNull();

    const noSci: Animal = {
      id: "mystery_beast",
      name: "Mystery Beast",
      aliases: [],
      traits: ["mammal", "carnivorous"],
    };
    expect(resolveAnimalImage(noSci)).toBeNull();
  });
});

