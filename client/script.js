import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
import axios from "axios";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const greetings = document.querySelector("#greetings");

let loadInterval;
let isAsked = false;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text, speed) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, speed);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}" 
              alt="${isAi ? "bot" : "user"}" 
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!isAsked) {
    document.getElementById("toggleView").style.display = "none";
    isAsked = true;
  }

  const data = new FormData(form);

  // user's chat
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // bot's chat
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  // The wrapper of bot's chat.
  const messageDiv = document.getElementById(uniqueId);

  // Starts waiting effect '...' for the bot's response
  loader(messageDiv);

  // Sends the prompt to the bot and stores its response to constant
  await axios
    .post("http://localhost:5000", {
      prompt: data.get("prompt"),
    })
    .then((res) => {
      // Stops the waiting effect '...' after receiving bot's response
      clearInterval(loadInterval);
      messageDiv.textContent = "";

      // Starts typing the result
      typeText(messageDiv, res.data.bot, 20);
    })
    .catch((err) => {
      messageDiv.textContent = "Something went wrong";
      console.log(err);
    });
}

typeText(greetings, "Hello! I'm Jarvis. How can I help you today?", 40);

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSubmit(event);
  }
});

