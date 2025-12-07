import { NextRequest, NextResponse } from 'next/server';

const TG_BOT_TOKEN: string | undefined = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramMessage {
  message_id: number;
  date: number; // Unix timestamp
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  caption?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
  }>;
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
  };
}

// Хелпер для определения типа чата
function isPrivateChat(chat: TelegramChat): boolean {
  return chat.type === 'private';
}

function isGroupChat(chat: TelegramChat): boolean {
  return chat.type === 'group' || chat.type === 'supergroup';
}

function getChatIdentifier(chat: TelegramChat): string {
  return chat.title || chat.username || chat.first_name || `Chat ${chat.id}`;
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json() as TelegramUpdate;
    if (TG_BOT_TOKEN) {
      processWebhookUpdate(update);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }

  return NextResponse.json({ ok: true });
}

async function processWebhookUpdate(update: TelegramUpdate) {
  try {
    if (update.message && isPrivateChat(update.message.chat)) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text;
      
      if (messageText === '/start') {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Этот бот работает только на отправку сообщений в групповой чат магазина.'
          })
        });
        
        // Закрываем чат через 5 секунд
        setTimeout(async () => {
          try {
            await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/deleteMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: update.message.message_id + 1 // ID нашего ответа
              })
            });
          } catch (e) {
            // Игнорируем ошибки удаления
          }
        }, 5000);
      }
      
      // Удаляем входящее сообщение пользователя
      try {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/deleteMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: update.message.message_id
          })
        });
      } catch (e) {
        // Не критично, если не удалось удалить
      }
    }
  }
  catch (error) {
    console.error('Webhook error:', error);
  }
}
