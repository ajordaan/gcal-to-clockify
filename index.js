import prompts from 'prompts';
import { mainMenu } from './menu';
import Setup from './setup.js'

(async () => {
  dotenv.config()

  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
  const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
  const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
  const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY
  const setup = new Setup(CLOCKIFY_API_KEY, { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_PROJECT_NUMBER, GOOGLE_CALENDAR_ID })
  mainMenu(prompts)
})();

