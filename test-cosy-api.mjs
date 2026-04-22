import { client } from "@gradio/client";

async function run() {
  try {
    const app = await client("FunAudioLLM/CosyVoice_300M_SFT");
    const endpoints = app.view_api();
    console.log(JSON.stringify(endpoints, null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
