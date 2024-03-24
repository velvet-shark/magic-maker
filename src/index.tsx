import { Button, Frog, TextInput } from "@airstack/frog";
import { devtools } from "@airstack/frog/dev";
import { serveStatic } from "@hono/node-server/serve-static";

export const app = new Frog();

app.frame("/", async (c) => {
  const { status } = c;
  return c.res({
    image: (
      <div
        style={{
          color: "white",
          display: "flex",
          fontSize: 40
        }}
      >
        {status === "initial" ? "Initial Frame" : "Response Frame"}
      </div>
    ),
    intents: [status === "initial" && <Button>Click Here</Button>]
  });
});

app.frame("/genre", async (c) => {
  const randomGenre = getRandomGenre();

  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          color: "white",
          fontSize: 32,
          paddingLeft: 40
        }}
      >
        <h1 style={{ marginBottom: 0 }}>Choose a genre for your fairy tale</h1>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>1. 🌈 Classic</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>2. 👸 Princesses & 🦄 Unicorns</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>3. 🌑 Dark</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>4. 🔀 Random</h3>
      </div>
    ),
    intents: [
      <Button value="Classic">1</Button>,
      <Button value="Princesses & Unicorns">2</Button>,
      <Button value="Dark">3</Button>,
      <Button value={randomGenre}>Random</Button>
    ]
  });
});

app.frame("/protagonist", async (c) => {
  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          color: "white",
          fontSize: 32,
          paddingLeft: 40
        }}
      >
        <h1 style={{ marginBottom: 0 }}>Choose a name for your main hero</h1>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♀️ Luna</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♀️ Aria</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♂️ Finn</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🫵 Your choice</h3>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter a name of your choice..." />,
      <Button value="Luna">Luna</Button>,
      <Button value="Aria">Aria</Button>,
      <Button value="Finn">Finn</Button>,
      <Button value={c.inputText ? `, Typed: ${c.inputText}` : ""}>Your choice</Button>
    ]
  });
});

const allGenres = [
  "Classic",
  "Princesses and Unicorns",
  "Animal Fables",
  "Enchanted Forests",
  "Heroic Quests",
  "Trickster Tales",
  "Magical Objects",
  "Mythical Creatures",
  "Mysteries",
  "Dark"
];

function getRandomGenre() {
  const randomIndex = Math.floor(Math.random() * allGenres.length);
  return allGenres[randomIndex];
}

devtools(app, { serveStatic });
