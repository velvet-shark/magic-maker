import { Button, Frog, TextInput } from "@airstack/frog";
import { devtools } from "@airstack/frog/dev";
import { serveStatic } from "@hono/node-server/serve-static";
import * as dotenv from "dotenv";
dotenv.config();
import Anthropic from "@anthropic-ai/sdk";

// Defining state where all the important parts will be store that will be needed across frames
type State = {
  genre: string;
  protagonist: string;
  storyParts: string[];
};

// export const app = new Frog();
export const app = new Frog<{ State: State }>();

// Initial frame
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

// Select genre
app.frame("/genre", async (c) => {
  const randomGenre = getRandomGenre();

  return c.res({
    action: "/protagonist",
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

// Select protagonist
app.frame("/protagonist", async (c) => {
  const { buttonValue } = c;
  return c.res({
    action: "/intro",
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
        Genre: {buttonValue}
        <h1 style={{ marginBottom: 0 }}>Choose a name for your main hero</h1>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♀️ Luna</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♀️ Aria</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♂️ Finn</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🫵 Your choice</h3>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter a name of your choice..." />,
      // <Button value="Luna">Luna</Button>,
      <Button value={`${buttonValue as string} | Luna`}>Luna</Button>,
      <Button value={`${buttonValue as string} | Aria`}>Aria</Button>,
      <Button value={`${buttonValue as string} | Finn`}>Finn</Button>,
      // <Button value={c.inputText ? c.inputText : ""}>Your choice</Button>
      <Button value={`${buttonValue as string} | ${c.inputText}`}>Finn</Button>
    ]
  });
});

app.frame("/intro", async (c) => {
  const { buttonValue } = c;
  const [genre, protagonist] = buttonValue ? buttonValue.split(" | ") : ["Princesses & Unicorns", "Luna"]; // Just in case, if error occurs and buttonValue is undefined, default to unicorns and Luna

  const prompt = `Write an engaging introduction to a ${genre} fairy tale, setting the scene and introducing the main character, ${protagonist}. The introduction should hint at the upcoming adventure and the challenges the protagonist might face. End the introduction with a clear decision point, presenting two distinct paths the story could take. Each path should be a single sentence, on separate numbered lines, starting with an action verb. Limit the introduction to 150 words.`;

  const anthropic = new Anthropic({
    apiKey: process.env["ANTHROPIC_API_KEY"]
  });

  const msg = await anthropic.messages.create({
    // Decide on the model:
    // - Opus is best but also slowest and most expensive.
    // - Haiku is fast and cheap but sometimes doesn't follow the instructions 100%.
    // - Sonnet is almost as good as Opus, but faster and cheaper, much better at following instructions than Haiku.
    // Uncomment the line you want to use and comment the other two.

    // model: "claude-3-opus-20240229",
    model: "claude-3-sonnet-20240229",
    // model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    messages: [{ role: "user", content: `${prompt}` }]
  });
  console.log(msg);

  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          color: "white",
          fontSize: 26,
          padding: 20
        }}
      >
        {/* <p>{msg.content[0].text.split("\n").join("<br />")}</p> */}
        {msg.content[0].text.split("\n").map((line, index) => (
          <p key={index} style={{ margin: "0 0 10px 0" }}>
            {line}
          </p>
        ))}
      </div>
    ),
    intents: [<Button value="1">1</Button>, <Button value="2">2</Button>]
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
