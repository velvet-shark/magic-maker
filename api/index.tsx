import { Button, Frog } from "@airstack/frog";
import { handle } from "@airstack/frog/vercel";
import { devtools } from "@airstack/frog/dev";
import { serveStatic } from "@hono/node-server/serve-static";
import * as dotenv from "dotenv";
dotenv.config();
import Anthropic from "@anthropic-ai/sdk";

export const app = new Frog({
  apiKey: process.env.AIRSTACK_API_KEY as string,
  assetsPath: "/",
  basePath: "/api"
});

// Initial frame
app.frame("/", async (c) => {
  return c.res({
    action: "/genre",
    image: "https://www.velvetshark.com/images/MagicMakerFrame.png",
    intents: [<Button>Let’s make some magic ✨</Button>]
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
        <span style={{ margin: "20px 0 15px 0", color: "green" }}>Genre: {buttonValue}</span>
        <h1 style={{ margin: 0 }}>Choose a name for your main hero</h1>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♀️ Luna</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♀️ Aria</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♂️ Finn</h3>
        <h3 style={{ fontSize: 50, marginBottom: 0 }}>🙋‍♂️ Elias</h3>
      </div>
    ),
    intents: [
      <Button value={`${buttonValue as string} | Luna`}>Luna</Button>,
      <Button value={`${buttonValue as string} | Aria`}>Aria</Button>,
      <Button value={`${buttonValue as string} | Finn`}>Finn</Button>,
      <Button value={`${buttonValue as string} | Elias`}>Elias</Button>
    ]
  });
});

// First part of the tale
app.frame("/intro", async (c) => {
  const { buttonValue } = c;
  const [genre, protagonist] = buttonValue ? buttonValue.split(" | ") : ["Princesses & Unicorns", "Luna"]; // Just in case, if error occurs and buttonValue is undefined, default to unicorns and Luna

  const prompt = `You are an enchanted storyteller, a weaver of whimsical fairy tales that captivate and delight. Your magical quill has the power to craft immersive stories based on the choices and desires of those who seek your tales.
  
  Your task is to guide a curious adventurer through the creation of their own fairy tale, step by step. They have already chosen a genre for their story, as well as the protagonist's name.

  Now, write an engaging introduction to a ${genre} fairy tale, setting the scene, introducing the main character, ${protagonist}, and hinting at the adventures that await. The introduction should hint at the upcoming adventure and the challenges the protagonist might face. End the introduction with a clear decision point, presenting two distinct paths the story could take. Each path should be a single sentence, on separate numbered lines, starting with an action verb. Limit the introduction to 150 words.`;

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

  const introText = (
    <div
      style={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      {msg.content[0].text.split("\n").map((line, index) => (
        <p key={index} style={{ margin: "0 0 10px 0" }}>
          {line}
        </p>
      ))}
    </div>
  );

  const introMsg = msg.content[0].text;

  return c.res({
    action: "/story",
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
        {introText}
      </div>
    ),
    intents: [
      <Button value={`${introMsg} | 1`}>Choose path 1</Button>,
      <Button value={`${introMsg} | 2`}>Choose path 2</Button>
    ]
  });
});

// Second part of the tale
app.frame("/story", async (c) => {
  const { buttonValue } = c;
  const [introMsg, introChoice] = buttonValue ? buttonValue.split(" | ") : ["", ""];

  const prompt = `You are an enchanted storyteller, a weaver of whimsical fairy tales that captivate and delight. Your magical quill has the power to craft immersive stories based on the choices and desires of those who seek your tales.
  
Your task is to guide a curious adventurer through the creation of their own fairy tale, step by step. They have already chosen a genre for their story and the protagonist's name.

You also have already written an engaging introduction and gave two choices to proceed.

The introduction is as follows: ${introMsg}.

The choice made was: ${introChoice}.

Continue the fairy tale, building upon the path chosen in the previous step. Develop the story, introducing new characters, settings, or challenges as appropriate. Maintain a sense of excitement and anticipation. End this segment with another decision point, offering two possible actions to take. Each path should be a single sentence, on separate numbered lines, starting with an action verb. Limit this segment to 150 words.`;

  const anthropic = new Anthropic({
    apiKey: process.env["ANTHROPIC_API_KEY"]
  });

  const msg = await anthropic.messages.create({
    // model: "claude-3-opus-20240229",
    model: "claude-3-sonnet-20240229",
    // model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    messages: [{ role: "user", content: `${prompt}` }]
  });
  console.log(msg);

  const storyText = (
    <div
      style={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      {msg.content[0].text.split("\n").map((line, index) => (
        <p key={index} style={{ margin: "0 0 10px 0" }}>
          {line}
        </p>
      ))}
    </div>
  );

  const storyMsg = msg.content[0].text;

  return c.res({
    action: "/finaldecision",
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
        {storyText}
      </div>
    ),
    intents: [
      <Button value={`${introMsg} | ${storyMsg} | 1`}>Choose path 1</Button>,
      <Button value={`${introMsg} | ${storyMsg} | 2`}>Choose path 2</Button>
    ]
  });
});

// Final decision
app.frame("/finaldecision", async (c) => {
  const { buttonValue } = c;
  const [intro, story, choice] = buttonValue ? buttonValue.split(" | ") : ["", "", ""];

  const prompt = `You are an enchanted storyteller, a weaver of whimsical fairy tales that captivate and delight. Your magical quill has the power to craft immersive stories based on the choices and desires of those who seek your tales.
  
Your task is to guide a curious adventurer through the creation of their own fairy tale, step by step. They have already chosen a genre for their story and the protagonist's name.

You also have already written an engaging introduction and gave two choices to proceed. You have also already developed the story and introduced new characters, settings, or challenges, giving another path to take.

The introduction is as follows: ${intro}.

The continuation of the story is as follows: ${story}.

The choice made in the continuation was: ${choice}.

Advance the fairy tale, following the path selected in the previous step. Raise the stakes, introduce plot twists, or present new obstacles to overcome. Build towards the story's climax. Conclude this segment with a final decision point, giving two clear choices that will determine the outcome of the adventure. Each path should be a single sentence, on separate numbered lines, starting with an action verb. Limit this segment to 150 words.`;

  const anthropic = new Anthropic({
    apiKey: process.env["ANTHROPIC_API_KEY"]
  });

  const msg = await anthropic.messages.create({
    // model: "claude-3-opus-20240229",
    model: "claude-3-sonnet-20240229",
    // model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    messages: [{ role: "user", content: `${prompt}` }]
  });
  console.log(msg);

  const finalDecisionText = (
    <div
      style={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      {msg.content[0].text.split("\n").map((line, index) => (
        <p key={index} style={{ margin: "0 0 10px 0" }}>
          {line}
        </p>
      ))}
    </div>
  );

  const finalDecisionMsg = msg.content[0].text;

  return c.res({
    action: "/conclusion",
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
        {finalDecisionText}
      </div>
    ),
    intents: [
      <Button value={`${intro} | ${story} | ${finalDecisionMsg} | 1`}>Choose path 1</Button>,
      <Button value={`${intro} | ${story} | ${finalDecisionMsg} | 2`}>Choose path 2</Button>
    ]
  });
});

// Conclusion
app.frame("/conclusion", async (c) => {
  const { buttonValue } = c;
  const [intro, story, finalDecision, choice] = buttonValue ? buttonValue.split(" | ") : ["", "", ""];

  const prompt = `You are an enchanted storyteller, a weaver of whimsical fairy tales that captivate and delight. Your magical quill has the power to craft immersive stories based on the choices and desires of those who seek your tales.
  
Your task is to guide a curious adventurer through the creation of their own fairy tale, step by step. They have already chosen a genre for their story and the protagonist's name.

You also have already written an engaging introduction and gave two choices to proceed. You have also already developed the story and introduced new characters, settings, or challenges, giving another path to take.

The introduction is as follows: ${intro}.

The continuation of the story is as follows: ${story}.

The final decision part was as follows: ${finalDecision}.

The final choice made was: ${choice}.

Bring the fairy tale to a satisfying close, based on the final choice made in the previous step. Resolve the main conflicts, reveal any remaining secrets, and describe the consequences of the decisions throughout the story. Provide a sense of closure while leaving room for the reader's imagination. If appropriate for the genre and tone, consider ending with a moral or lesson learned. Limit the conclusion to 150 words.`;

  const anthropic = new Anthropic({
    apiKey: process.env["ANTHROPIC_API_KEY"]
  });

  const msg = await anthropic.messages.create({
    // model: "claude-3-opus-20240229",
    model: "claude-3-sonnet-20240229",
    // model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    messages: [{ role: "user", content: `${prompt}` }]
  });
  console.log(msg);

  const conclusionText = (
    <div
      style={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      {msg.content[0].text.split("\n").map((line, index) => (
        <p key={index} style={{ margin: "0 0 10px 0" }}>
          {line}
        </p>
      ))}
    </div>
  );

  const conclusionMsg = msg.content[0].text;

  return c.res({
    action: "/conclusion",
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
        {conclusionText}
      </div>
    ),
    intents: [
      <Button value={`${intro} | ${story} | ${finalDecision} | ${conclusionMsg}`}>Save the tale. Forever.</Button>
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
